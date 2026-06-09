import { useInfiniteQuery } from '@tanstack/react-query';

import { getPosts } from '@/api/generated/endpoints/posts/posts';
import { GetPostsParams } from '@/api/generated/schemas';

export function usePostsInfinite(params: Omit<GetPostsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: ['/posts', params],
    queryFn: ({ pageParam, signal }) =>
      getPosts({ ...params, cursor: pageParam ?? undefined }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}
