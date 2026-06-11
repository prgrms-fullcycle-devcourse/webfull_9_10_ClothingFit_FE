import { useBodyInfo } from '@/features/profile/api';

import { MOCK_BODY } from '../data/mock-body';
import type { BodyMeasurements } from '../utils/fit-check';

/**
 * 사용자 체형 데이터의 단일 출처(seam).
 *
 * 실제 body_info API(`GET /profile/body`)를 읽어 핏 판정용 형태로 매핑한다.
 * → 간편/상세 체형 수정이 사이즈 비교(핏 판정)에 바로 반영된다.
 *
 * 매핑 주의:
 *  - API `footSize`는 mm, 핏 판정 `footLength`는 cm → ÷10
 *  - API `head` → `headCirc` (이름만 다름)
 *  - 값이 없으면(null/로딩 전) MOCK_BODY로 폴백해 핏 판정이 항상 동작하게 한다.
 */
export function useBodyMeasurements(): BodyMeasurements {
  const { data } = useBodyInfo();
  if (!data) return MOCK_BODY;

  return {
    height: data.height ?? MOCK_BODY.height,
    weight: data.weight ?? MOCK_BODY.weight,
    chest: data.chest ?? MOCK_BODY.chest,
    waist: data.waist ?? MOCK_BODY.waist,
    hip: data.hip ?? MOCK_BODY.hip,
    shoulder: data.shoulder ?? MOCK_BODY.shoulder,
    footLength: data.footSize != null ? data.footSize / 10 : MOCK_BODY.footLength,
    headCirc: data.head ?? MOCK_BODY.headCirc,
  };
}
