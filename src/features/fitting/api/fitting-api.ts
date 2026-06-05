import type { FittingItem } from '../types';

export type FittingResult = { imageUri: string | null };

/**
 * 2D 아바타 생성.
 *
 * ⚠️ 백엔드 + Gemini banana API 연동 지점.
 * 현재는 mock: 일정 시간 뒤 결과를 반환하며, 데모용으로 담은 옷 중 첫 이미지를
 * 결과 이미지처럼 돌려준다. 실제 연동 시 이 함수 내부만 API 호출로 교체하면 된다.
 */
export async function generateFitting(items: FittingItem[]): Promise<FittingResult> {
  await new Promise((resolve) => setTimeout(resolve, 3500));
  const firstImage = items.find((i) => i.imageUri)?.imageUri ?? null;
  return { imageUri: firstImage };
}
