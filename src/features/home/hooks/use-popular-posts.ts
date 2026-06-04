import { useQuery } from '@tanstack/react-query';

import { getPopularPosts } from '../api/home';

export const popularPostsQueryKey = ['home', 'popular-posts'] as const;

/** 메인 화면 인기글 목록 조회 훅 */
export function usePopularPosts() {
  return useQuery({
    queryKey: popularPostsQueryKey,
    queryFn: getPopularPosts,
  });
}
