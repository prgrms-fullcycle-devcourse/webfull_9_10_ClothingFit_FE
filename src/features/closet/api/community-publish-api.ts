import { apiClient } from '@/lib/api-client';

/**
 * 커뮤니티 게시 내리기 = 연결된 게시글 삭제.
 *
 * 생성된 Orval 클라이언트엔 `DELETE /posts/:id` 훅이 없어(스펙 누락) 직접 호출한다.
 * 백엔드가 post를 soft-delete + `closetArchiveId` 연결을 끊어서, 이후 옷장 상세의
 * `isPublished`가 자동으로 false가 된다.
 */
export function unpublishPost(postId: string) {
  return apiClient<void>({ url: `/posts/${postId}`, method: 'DELETE' });
}
