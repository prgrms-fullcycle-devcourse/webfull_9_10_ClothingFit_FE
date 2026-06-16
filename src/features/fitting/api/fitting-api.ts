import { apiClient } from '@/lib/api-client';

import type { FittingItem } from '../types';
import { fittingErrorMessage } from './fitting-error';

export type FittingResult = {
  imageUri: string | null;
  archiveId?: string;
  outfitName?: string;
};

/** 백엔드 2D 생성 응답 (POST /fitting/2d) */
type GenerateCoordiResponse = {
  imageUrl: string;
  archiveId?: string;
  outfitName?: string;
};

/** 2D 생성 요청 엔드포인트 */
const GENERATE_ENDPOINT = '/fitting/2d';

/** 카테고리 → multipart 이미지 파트 이름 (예: top → image_top) */
function imageFieldName(category: string): string {
  return `image_${category}`;
}

/**
 * 의류 items → multipart/form-data 빌드.
 *
 * 계약(백엔드 POST /fitting/2d):
 *  - `meta`: JSON 문자열. items 배열(category·selectedSize·imageField·selectedMeasurements·title·sourceUrl·sizeTable·sizeTableSource)
 *  - `image_<category>`: 캡처 이미지 파일 (담은 카테고리만)
 *  - 체형은 보내지 않음 → 백엔드가 토큰(user_id)으로 body_info/profiles/user_character에서 조회
 */
export function buildFittingFormData(items: FittingItem[]): FormData {
  const form = new FormData();

  const metaItems = items.map((it) => ({
    category: it.category,
    selectedSize: it.selectedSize ?? null,
    imageField: it.imageUri ? imageFieldName(it.category) : null,
    brand: it.brand ?? null,
    name: it.productName ?? null,
    title: it.title ?? null, // 원본(브랜드 포함)
    sourceUrl: it.sourceUrl ?? null,
    selectedMeasurements: it.measurements ?? null,
    sizeTable: it.sizeTable ?? null,
    sizeTableSource: it.sizeTableSource ?? null,
  }));
  form.append('meta', JSON.stringify({ items: metaItems }));

  // 캡처 이미지(file://)를 카테고리별 파트로 첨부
  for (const it of items) {
    if (!it.imageUri) continue;
    // RN multipart 파일 객체 ({ uri, name, type }) — DOM FormData 타입엔 없어 캐스팅
    form.append(imageFieldName(it.category), {
      uri: it.imageUri,
      name: `${it.category}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);
  }

  return form;
}

/**
 * 2D 코디 생성 (백엔드 + Gemini).
 *
 * 체형은 백엔드가 토큰→DB(body_info/profiles/user_character)에서 조회하므로
 * FE는 의류(사진·사이즈)만 보낸다. apiClient(axios)가 토큰·multipart를 자동 처리.
 *
 * 전제: ① 로그인(토큰) ② 아바타(체형) 등록 — 없으면 401/404.
 */
export async function generateFitting(items: FittingItem[]): Promise<FittingResult> {
  try {
    const res = await apiClient<GenerateCoordiResponse>({
      url: GENERATE_ENDPOINT,
      method: 'POST',
      data: buildFittingFormData(items),
      // 2D 생성은 서버에서 오래 걸림(Gemini). 백엔드 nginx/worker 타임아웃(180s)보다
      // 살짝 크게 잡아, FE가 먼저 끊지 않고 서버 응답(성공/504)을 받게 한다.
      // (전역 기본 30s로는 30초에 ERR_NETWORK로 먼저 끊김)
      // TODO: 백엔드 2D 비동기(잡+폴링) 전환 시 이 타임아웃은 제거하고 폴링으로 교체.
      timeout: 185_000,
    });
    return { imageUri: res.imageUrl, archiveId: res.archiveId, outfitName: res.outfitName };
  } catch (e: unknown) {
    throw new Error(fittingErrorMessage(e));
  }
}
