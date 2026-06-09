import type { BodyMeasurements } from '../utils/fit-check';

/**
 * 체형 등록(body_info) API 연동 전 임시 mock.
 * 실제 연동 시 body_info 스토어/쿼리 결과로 교체한다.
 * (단위: cm, 둘레 기준 / 발길이·머리둘레 포함)
 */
export const MOCK_BODY: BodyMeasurements = {
  height: 178,
  weight: 72,
  chest: 96,
  waist: 82,
  hip: 97,
  shoulder: 46,
  footLength: 26,
  headCirc: 57,
};
