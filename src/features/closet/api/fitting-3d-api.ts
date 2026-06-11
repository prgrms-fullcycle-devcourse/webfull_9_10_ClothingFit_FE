import { apiClient } from '@/lib/api-client';

/**
 * 3D 피팅(Mesh AI) API — 직접 호출 모듈.
 *
 * ⚠️ 생성된 Orval 클라이언트(`endpoints/fitting`)는 배포된 백엔드와 어긋나 있어
 * (경로 `/fitting/3d/:id`인데 생성코드는 `/fitting/:id`, 응답도 `{data}` 래핑 없음)
 * 실제 엔드포인트에 맞춰 여기서 직접 호출한다. 스펙이 정리되면 generate로 교체 가능.
 */

export type Fitting3DStatus = 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export type Fitting3DStatusResult = {
  status: Fitting3DStatus;
  progress?: number;
  /** SUCCEEDED일 때 Mesh AI 원본 glb URL */
  glbUrl: string | null;
  thumbnailUrl: string | null;
};

/** POST /fitting/3d — 3D 변환 시작 → sessionId */
export function start3DFitting(closetArchiveId: string) {
  return apiClient<{ sessionId: string }>({
    url: '/fitting/3d',
    method: 'POST',
    data: { closetArchiveId },
  });
}

/** GET /fitting/3d/:sessionId — 진행 상태 폴링 */
export function get3DFittingStatus(sessionId: string) {
  return apiClient<Fitting3DStatusResult>({
    url: `/fitting/3d/${sessionId}`,
    method: 'GET',
  });
}

/** POST /fitting/3d/:sessionId/model — 변환 결과(glb)를 옷장 아카이브에 저장 → modelUrl */
export function save3DFittingModel(sessionId: string) {
  return apiClient<{ modelUrl: string }>({
    url: `/fitting/3d/${sessionId}/model`,
    method: 'POST',
  });
}
