import type { SizeTable } from '@/features/webview/api/musinsa-size-api';
import type { CategoryId } from '@/features/webview/constants/categories';
import type { SizeOption, SizeTableSource } from '@/features/webview/types/copy-session';
import { resolveMeasurementsForDisplay } from '@/features/webview/utils/resolve-slot-measurements';

/**
 * 사이즈 ↔ 체형 핏 비교 (순수 로직).
 *
 * 의류 사이즈표의 측정값과 사용자 체형을 카테고리별로 비교해
 *  - 못 입음(small) / 잘 맞음(fit) / 넉넉(loose) 을 판정하고
 *  - 입을 수 있는 사이즈 범위를 추천한다.
 *
 * ⚠️ 여유분(ease)은 sizeTable 출처에 따라 다르다:
 *   - actual/image(옷 실측)  → 옷이 몸보다 커야 입으므로 +여유 필요
 *   - reference(권장 신체치수) → 이미 몸 기준이라 여유 0
 *   판정에는 resolveMeasurementsForDisplay가 돌려준 source를 사용한다.
 */

/** 사용자 체형 (cm, 둘레 기준). 발길이는 cm. */
export type BodyMeasurements = {
  height: number;
  weight: number;
  chest?: number; // 가슴둘레
  waist?: number; // 허리둘레
  hip?: number; // 엉덩이둘레
  shoulder?: number; // 어깨너비
  footLength?: number; // 발길이(cm)
  headCirc?: number; // 머리둘레
};

export type FitVerdict = 'fit' | 'small' | 'loose';

export type PartDetail = {
  /** 비교 항목 라벨 (예: '가슴') */
  part: string;
  /** 체형 값 */
  body: number;
  /** 의류 값 (단면이면 둘레로 환산됨) */
  garment: number;
  /** 적용된 여유분 */
  ease: number;
  status: 'ok' | 'small' | 'loose';
};

export type FitResult = {
  verdict: FitVerdict;
  /** 작아서 안 맞는 항목 라벨 (예: ['가슴', '어깨']) */
  failedParts: string[];
  /** 입을 수 있는 사이즈 라벨 (후보군 순서대로) */
  recommendedSizes: string[];
  /** 항목별 상세 비교 */
  details: PartDetail[];
  /** 비교할 체형/사이즈표 데이터가 부족해 판정 불가 */
  insufficientData: boolean;
};

type CompareSpec = {
  part: string;
  bodyKey: keyof BodyMeasurements;
  /** 의류 표 측정항목 부분 매칭 키워드 */
  keyword: string;
  /** 실측(actual/image) 기준 최소 여유분 */
  baseEase: number;
  /** 여유가 이만큼 이상 남으면 '넉넉(loose)' */
  looseOver: number;
};

/**
 * 카테고리별 비교 항목.
 * 상의/아우터=가슴, 하의=허리+엉덩이, 모자=머리둘레, 신발=발길이.
 * (여유분 값은 MVP 시작치 — 실데이터로 튜닝 예정. 재질·성별 보정은 고도화)
 */
const SPEC: Record<CategoryId, CompareSpec[]> = {
  top: [{ part: '가슴', bodyKey: 'chest', keyword: '가슴', baseEase: 4, looseOver: 12 }],
  outer: [{ part: '가슴', bodyKey: 'chest', keyword: '가슴', baseEase: 8, looseOver: 16 }],
  bottom: [
    { part: '허리', bodyKey: 'waist', keyword: '허리', baseEase: 2, looseOver: 8 },
    { part: '엉덩이', bodyKey: 'hip', keyword: '엉덩이', baseEase: 4, looseOver: 10 },
  ],
  hat: [{ part: '머리둘레', bodyKey: 'headCirc', keyword: '머리둘레', baseEase: 0, looseOver: 3 }],
  shoes: [
    { part: '발길이', bodyKey: 'footLength', keyword: '발길이', baseEase: 0.5, looseOver: 1.5 },
  ],
};

/** 의류 표 row에서 비교 항목 값 추출. 단면(반쪽)은 둘레로 ×2. */
function garmentValue(row: Record<string, number>, keyword: string): number | null {
  const hit = Object.entries(row).find(([k]) => k.includes(keyword));
  if (!hit) return null;
  const [key, val] = hit;
  if (typeof val !== 'number' || Number.isNaN(val)) return null;
  // 가슴단면/허리단면 = 반쪽 → 둘레로 환산. 발길이·머리둘레·어깨너비는 단면 아님.
  return key.includes('단면') ? val * 2 : val;
}

/** 한 사이즈에 대한 핏 판정 */
function fitForSize(
  category: CategoryId,
  size: string,
  sizeTable: SizeTable | undefined,
  source: SizeTableSource | undefined,
  body: BodyMeasurements,
): Pick<FitResult, 'verdict' | 'failedParts' | 'details' | 'insufficientData'> {
  const specs = SPEC[category] ?? [];
  const resolved = resolveMeasurementsForDisplay(category, size, sizeTable, source);
  const row = resolved.measurements;
  // 기준표로 보완된 값은 이미 권장 신체치수 → 여유분 0
  const easeZero = resolved.source === 'reference';

  if (!row) return { verdict: 'fit', failedParts: [], details: [], insufficientData: true };

  const details: PartDetail[] = [];
  let anySmall = false;
  let anyLoose = false;

  for (const spec of specs) {
    const bodyVal = body[spec.bodyKey];
    const garment = garmentValue(row, spec.keyword);
    if (typeof bodyVal !== 'number' || garment == null) continue; // 데이터 없으면 항목 스킵
    const ease = easeZero ? 0 : spec.baseEase;
    const margin = garment - (bodyVal + ease);
    let status: PartDetail['status'] = 'ok';
    if (margin < 0) {
      status = 'small';
      anySmall = true;
    } else if (margin >= spec.looseOver) {
      status = 'loose';
      anyLoose = true;
    }
    details.push({ part: spec.part, body: bodyVal, garment, ease, status });
  }

  if (details.length === 0) {
    return { verdict: 'fit', failedParts: [], details, insufficientData: true };
  }

  const failedParts = details.filter((d) => d.status === 'small').map((d) => d.part);
  const verdict: FitVerdict = anySmall ? 'small' : anyLoose ? 'loose' : 'fit';
  return { verdict, failedParts, details, insufficientData: false };
}

/**
 * 선택한 사이즈의 핏 판정 + 입을 수 있는 사이즈 추천.
 */
export function checkFit(params: {
  category: CategoryId;
  selectedSize: string;
  sizeTable?: SizeTable;
  sizeTableSource?: SizeTableSource;
  /** 추천 후보군 (구매 가능 사이즈). 없으면 sizeTable 키 사용 */
  sizeOptions?: SizeOption[];
  body: BodyMeasurements;
}): FitResult {
  const { category, selectedSize, sizeTable, sizeTableSource, sizeOptions, body } = params;

  const selected = fitForSize(category, selectedSize, sizeTable, sizeTableSource, body);

  // 입을 수 있는 사이즈 후보: 구매 가능 옵션 우선, 없으면 표 키
  const universe = sizeOptions?.length
    ? sizeOptions.map((o) => o.label)
    : sizeTable
      ? Object.keys(sizeTable)
      : [];

  const recommendedSizes = universe.filter((label) => {
    const r = fitForSize(category, label, sizeTable, sizeTableSource, body);
    return !r.insufficientData && r.verdict !== 'small';
  });

  return {
    verdict: selected.verdict,
    failedParts: selected.failedParts,
    recommendedSizes,
    details: selected.details,
    insufficientData: selected.insufficientData,
  };
}
