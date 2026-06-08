import { env } from '@/lib/env';

import type { FittingItem } from '../types';

export type FittingResult = { imageUri: string | null };

/** 백엔드 2D 생성 응답 */
type GenerateResponse = { imageUrl: string; archiveId?: string };

/** 2D 생성 요청 엔드포인트 (백엔드 확정 시 교체) */
const GENERATE_ENDPOINT = '/fitting/generate';

/** 카테고리 → multipart 이미지 파트 이름 (예: top → image_top) */
function imageFieldName(category: string): string {
  return `image_${category}`;
}

/**
 * 의류 items → multipart/form-data 빌드.
 *
 * 계약(백엔드 합의):
 *  - `meta`: JSON 문자열. items 배열(category·selectedSize·imageField·measurements·title·sourceUrl·sizeTable·sizeTableSource)
 *  - `image_<category>`: 캡처 이미지 파일 (담은 카테고리만)
 *  - 체형은 보내지 않음 → 백엔드가 토큰(user_id)으로 body_info에서 조회
 */
export function buildFittingFormData(items: FittingItem[]): FormData {
  const form = new FormData();

  const metaItems = items.map((it) => ({
    category: it.category,
    selectedSize: it.selectedSize ?? null,
    imageField: it.imageUri ? imageFieldName(it.category) : null,
    title: it.title ?? null,
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
 * 2D 아바타 생성.
 *
 * ⚠️ 백엔드 + Gemini 연동 지점.
 * 체형은 백엔드가 토큰→body_info에서 조회하므로 FE는 의류(사진·사이즈)만 보낸다.
 *
 * 현재는 백엔드 미연동 → mock(담은 옷 첫 이미지 반환). 연동 시:
 *   1) USE_BACKEND를 true로
 *   2) GENERATE_ENDPOINT 확인 + Authorization 헤더(토큰) 채우기
 * 그러면 buildFittingFormData로 만든 multipart를 POST해서 imageUrl을 받는다.
 */
export async function generateFitting(items: FittingItem[]): Promise<FittingResult> {
  const USE_BACKEND: boolean = false; // TODO(백엔드 연동): true로 전환

  if (USE_BACKEND) {
    const form = buildFittingFormData(items);
    const res = await fetch(`${env.apiUrl}${GENERATE_ENDPOINT}`, {
      method: 'POST',
      // headers: { Authorization: `Bearer ${token}` },  // 체형은 백엔드가 토큰으로 조회
      body: form,
    });
    if (!res.ok) throw new Error(`2D 생성 실패 (${res.status})`);
    const json = (await res.json()) as GenerateResponse;
    return { imageUri: json.imageUrl };
  }

  // --- 임시 mock (백엔드 연동 전) ---
  await new Promise((resolve) => setTimeout(resolve, 3500));
  const firstImage = items.find((i) => i.imageUri)?.imageUri ?? null;
  return { imageUri: firstImage };
}
