/**
 * auth feature API 파사드.
 * Orval 생성물을 도메인 이름으로 re-export 한다 — 훅은 생성 경로 대신 여기서 import.
 */
export {
  postAuthGoogle,
  postAuthKakao,
  deleteAuthLogout,
} from '@/api/generated/endpoints/auth/auth';
export type { KakaoLoginResponseData as LoginData } from '@/api/generated/schemas';
