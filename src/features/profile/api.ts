/**
 * profile feature API 파사드.
 * Orval 생성물을 도메인 이름으로 re-export 하고, 커서 페이지네이션 목록은 무한쿼리로 감싼다.
 */
import { useInfiniteQuery } from '@tanstack/react-query';

import { getProfileBookmarks } from '@/api/generated/endpoints/profile/profile';

export {
  getProfileNicknameCheck as checkNickname, // GET /profile/nickname/check (중복확인, 버튼 트리거)
  useGetProfile as useProfile, // GET /profile (닉네임·이미지·성별)
  useGetProfileBody as useBodyInfo,
  usePatchProfileBody as useUpdateBodyInfo,
  usePatchProfileNickname as useUpdateNickname, // PATCH /profile/nickname
} from '@/api/generated/endpoints/profile/profile';
export type {
  BodyInfoResponse as BodyInfo,
  PatchProfileBodyBody as BodyInfoInput,
  PostListItem,
  ProfileResponse as Profile,
} from '@/api/generated/schemas';

/** 북마크한 코디 목록 — GET /profile/bookmarks (커서 기반 무한 스크롤) */
export function useBookmarks(limit = 30) {
  return useInfiniteQuery({
    queryKey: ['profile', 'bookmarks', limit],
    queryFn: ({ pageParam }) =>
      getProfileBookmarks({ cursor: pageParam as string | undefined, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
  });
}
