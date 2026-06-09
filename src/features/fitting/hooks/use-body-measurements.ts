import { MOCK_BODY } from '../data/mock-body';
import type { BodyMeasurements } from '../utils/fit-check';

/**
 * 사용자 체형 데이터의 단일 출처(seam).
 *
 * 현재는 mock을 반환한다. 체형 등록(body_info) API/스토어가 준비되면
 * **이 함수 내부만** 실제 데이터 조회로 교체하면 전 화면에 반영된다.
 * (호출부 코드는 바꿀 필요 없음)
 *
 * TODO(body_info 연동): MOCK_BODY → body_info 쿼리/스토어 결과로 교체
 */
export function useBodyMeasurements(): BodyMeasurements {
  return MOCK_BODY;
}
