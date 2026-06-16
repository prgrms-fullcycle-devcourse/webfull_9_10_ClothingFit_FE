import { useInfiniteQuery } from '@tanstack/react-query';

import { getUsersIdPosts } from '@/api/generated/endpoints/users/users';

export function useUserPostsInfinite(userId: string) {
  return useInfiniteQuery({
    queryKey: [`/users/${userId}/posts`],
    queryFn: ({ pageParam, signal }) =>
      getUsersIdPosts(userId, { cursor: pageParam ?? undefined }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: !!userId,
  });
}
