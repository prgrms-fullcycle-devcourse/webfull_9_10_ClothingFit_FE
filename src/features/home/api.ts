/**
 * home feature API 파사드.
 * Orval 생성물을 도메인 이름으로 re-export 한다 — 화면/컴포넌트는 생성 경로 대신 여기서 import.
 */
export {
  useGetHomePopularPosts as usePopularPosts,
  useGetHomeRecommendedInfluencers as useRecommendedInfluencers,
} from '@/api/generated/endpoints/home/home';
export type {
  GetHomePopularPosts200Item as PopularPost,
  GetHomeRecommendedInfluencers200Item as RecommendedInfluencer,
} from '@/api/generated/schemas';
