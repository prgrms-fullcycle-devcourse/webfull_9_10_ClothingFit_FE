/**
 * COPY한 상품의 사이즈 데이터 분석 (스크래핑 결과 → sizeTable).
 *
 * 폭포수 (전 카테고리 동일)
 *  1. actual-size API (실측)
 *  2. HTML 표 (inject가 긁은 것)
 *  3. 이미지 OCR (Gemini)
 *  4. 내장 표준치 (reference)
 *
 * 신발도 진짜 이미지 사이즈표가 있는 브랜드가 많아 OCR을 탄다. OCR이 실패하면
 * reference가 mm/범위 라벨(예: "225-230")을 발길이로 매핑해 폴백한다.
 *
 * 화면(토스트/네비게이션)에 의존하지 않도록, 결과는 신호만 담아 반환한다.
 * → 크롭 화면 진입 즉시 백그라운드로 실행하고, "완료" 시 결과를 사용한다.
 */
import {
  extractMusinsaGoodsNo,
  fetchMusinsaActualSize,
  fetchMusinsaSizeOptions,
  type SizeTable,
} from '../api/musinsa-size-api';
import type { CategoryId } from '../constants/categories';
import type { ScrapeProductData } from '../inject/protocol';
import { looseCategoryFit } from '../store/pending-scrape-store';
import type { SizeOption, SizeTableSource } from '../types/copy-session';
import { normalizeSizeTable } from './normalize-measurements';
import { ocrSizeChartFromCandidates } from './ocr-size-chart';
import { buildReferenceSizeTable, logCopySizeData } from './resolve-slot-measurements';

export type SizeAnalysis = {
  data: ScrapeProductData;
  sizeOptions: SizeOption[];
  sizeTable?: SizeTable;
  sizeTableSource?: SizeTableSource;
  /** 선택 카테고리와 상품이 안 맞음 (제목 휴리스틱) */
  categoryMismatch: boolean;
};

/**
 * 스크래핑 Promise를 받아 사이즈 데이터를 분석한다.
 * scrapePromise가 reject되면 이 함수도 throw → 호출부에서 폴백 처리.
 */
export async function analyzeSize(
  scrapePromise: Promise<ScrapeProductData>,
  categoryId: CategoryId,
): Promise<SizeAnalysis> {
  const data = await scrapePromise;

  if (!looseCategoryFit(categoryId, data.title)) {
    return { data, sizeOptions: [], categoryMismatch: true };
  }

  let sizeOptions: SizeOption[] = [];
  let sizeTable: SizeTable | undefined;
  let sizeTableSource: SizeTableSource | undefined;

  const goodsNo = extractMusinsaGoodsNo(data.url);
  const htmlTable = data.sizeTable ? normalizeSizeTable(data.sizeTable, categoryId) : undefined;

  if (goodsNo) {
    const [options, actual] = await Promise.all([
      fetchMusinsaSizeOptions(goodsNo).catch(() => [] as SizeOption[]),
      fetchMusinsaActualSize(goodsNo).catch(() => null),
    ]);
    sizeOptions = options;

    // 폭포수(전 카테고리 동일): actual → HTML → 이미지 OCR → 내장 표준치
    // (신발도 진짜 이미지 사이즈표가 있는 브랜드가 많아 OCR을 탄다.)
    if (actual) {
      sizeTable = actual;
      sizeTableSource = 'actual';
    } else if (htmlTable) {
      sizeTable = htmlTable;
      sizeTableSource = 'html';
    } else if (data.sizeChartImageUrl || data.sizeChartCandidates?.length) {
      const candidates = [
        ...(data.sizeChartImageUrl ? [data.sizeChartImageUrl] : []),
        ...(data.sizeChartCandidates ?? []),
      ].filter((v, i, arr) => arr.indexOf(v) === i);
      const ocrRaw = await ocrSizeChartFromCandidates(candidates, categoryId);
      const ocrTable = ocrRaw ? normalizeSizeTable(ocrRaw, categoryId) : undefined;
      if (ocrTable) {
        sizeTable = ocrTable;
        sizeTableSource = 'image';
      }
    }

    // ★ 위에서 아무것도 못 채웠으면 내장 표준치로 최종 폴백.
    //   (OCR이 실패하거나 Gemini 할당량 초과여도 빈손이 되지 않도록 보장)
    if (!sizeTable && options.length > 0) {
      sizeTable = buildReferenceSizeTable(categoryId, options);
      sizeTableSource = sizeTable ? 'reference' : undefined;
      if (__DEV__)
        console.log(
          '[analyze] reference 폴백. options=',
          options.map((o) => o.label),
          '→',
          sizeTable ? JSON.stringify(sizeTable) : 'null(매핑 실패)',
        );
    }
  } else if (htmlTable) {
    sizeTable = htmlTable;
    sizeTableSource = 'html';
  }

  logCopySizeData({
    title: data.title,
    categoryId,
    sizeTableSource,
    sizeTable,
    sizeOptionLabels: sizeOptions.map((o) => o.label),
  });

  return { data, sizeOptions, sizeTable, sizeTableSource, categoryMismatch: false };
}
