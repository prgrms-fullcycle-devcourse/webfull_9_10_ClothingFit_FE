/**
 * profile feature API 파사드.
 * Orval 생성물을 도메인 이름으로 re-export 한다.
 */
export {
  useGetProfileBody as useBodyInfo,
  usePatchProfileBody as useUpdateBodyInfo,
} from '@/api/generated/endpoints/profile/profile';
export type {
  BodyInfoResponse as BodyInfo,
  PatchProfileBodyBody as BodyInfoInput,
} from '@/api/generated/schemas';
