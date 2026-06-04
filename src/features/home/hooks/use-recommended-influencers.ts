import { useQuery } from '@tanstack/react-query';

import { getRecommendedInfluencers } from '../api/home';

export const recommendedInfluencersQueryKey = ['home', 'recommended-influencers'] as const;

/** 메인 화면 추천 인플루언서 조회 훅 */
export function useRecommendedInfluencers() {
  return useQuery({
    queryKey: recommendedInfluencersQueryKey,
    queryFn: getRecommendedInfluencers,
  });
}
