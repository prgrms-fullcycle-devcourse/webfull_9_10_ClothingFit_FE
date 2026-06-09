import { apiClient } from '@/lib/api-client';

import type { FittingItem } from '../types';

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
  const USE_BACKEND = true; // 백엔드 연동됨 (mock 끔)

  if (USE_BACKEND) {
    try {
      const res = await apiClient<GenerateCoordiResponse>({
        url: GENERATE_ENDPOINT,
        method: 'POST',
        data: buildFittingFormData(items),
      });
      return { imageUri: res.imageUrl, archiveId: res.archiveId, outfitName: res.outfitName };
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown }; message?: string };
      // 진단 로그 (원인 파악용 — 추후 제거)
      console.log(
        '[fitting:2d 실패]',
        'status=',
        err?.response?.status,
        'data=',
        JSON.stringify(err?.response?.data)?.slice(0, 300),
        'msg=',
        err?.message,
      );
      const status = err?.response?.status;
      if (status === 401) throw new Error('로그인이 필요해요');
      if (status === 404) throw new Error('아바타(체형) 정보가 없어요. 체형을 먼저 등록해 주세요');
      if (status === 504) throw new Error('생성이 오래 걸려요. 잠시 후 다시 시도해 주세요');
      throw e instanceof Error ? e : new Error('2D 생성 실패');
    }
  }

  // --- 임시 mock (백엔드 미연동 시) ---
  await new Promise((resolve) => setTimeout(resolve, 3500));
  const firstImage = items.find((i) => i.imageUri)?.imageUri ?? null;
  return { imageUri: firstImage };
}
