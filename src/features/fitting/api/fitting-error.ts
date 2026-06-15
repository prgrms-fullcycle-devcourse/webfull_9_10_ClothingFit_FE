/**
 * 2D 생성 등 axios 요청 실패를 사용자 친화 메시지로 변환하는 순수 함수.
 * 네트워크/타임아웃/HTTP 상태별로 매핑하고, 백엔드가 준 사유(response.data.message)를 우선한다.
 * (순수 함수 — RN 의존성 없음. 단위 검증 가능)
 */
export function fittingErrorMessage(e: unknown): string {
  const err = e as {
    response?: { status?: number; data?: { message?: string } };
    code?: string;
    message?: string;
  };
  const status = err?.response?.status;
  // 백엔드가 구체 사유(예: AI 쿼터 초과·저장공간 부족)를 주면 그걸 우선 노출
  const serverMsg = err?.response?.data?.message;

  // 응답 자체가 없는 경우 — 네트워크/타임아웃
  if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message ?? ''))
    return '생성 시간이 초과됐어요. 잠시 후 다시 시도해 주세요';
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error')
    return '네트워크 연결을 확인해 주세요';

  // HTTP 상태별
  if (status === 400) return serverMsg ?? '요청 정보가 올바르지 않아요';
  if (status === 401) return '로그인이 필요해요';
  if (status === 403) return '권한이 없어요';
  if (status === 404) return '아바타(체형) 정보가 없어요. 체형을 먼저 등록해 주세요';
  if (status === 413) return '이미지 용량이 너무 커요';
  if (status === 429) return '요청이 많아요. 잠시 후 다시 시도해 주세요';
  if (status === 504) return '생성이 오래 걸려요. 잠시 후 다시 시도해 주세요';
  if (status && status >= 500)
    return serverMsg ?? '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요';

  return serverMsg ?? (e instanceof Error ? e.message : '2D 생성에 실패했어요');
}
