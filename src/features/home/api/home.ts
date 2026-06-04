import { apiClient } from '@/lib/api-client';

/** GET /home/popular-posts 응답 항목 (최대 10개) */
export type PopularPost = {
  /** 게시글 대표 이미지 URL */
  image: string;
  nickname: string;
  /** ISO 8601 date-time */
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  /** 게시글에 사용된 옷 이미지 URL (최대 5) */
  itemImages: string[];
};

/** GET /home/recommended-influencers 응답 항목 (최대 10개) */
export type RecommendedInfluencer = {
  /** 대표 게시글 이미지 URL (없을 수 있음) */
  postImage: string | null;
  /** 프로필 이미지 URL (없을 수 있음) */
  profileImage: string | null;
  nickname: string;
  followerCount: number;
  isFollowing: boolean;
};

/** 메인 화면 인기글 목록 조회 */
export async function getPopularPosts(): Promise<PopularPost[]> {
  return (await apiClient({
    url: '/home/popular-posts',
    method: 'GET',
  })) as PopularPost[];
}

/** 메인 화면 추천 인플루언서 조회 */
export async function getRecommendedInfluencers(): Promise<RecommendedInfluencer[]> {
  return (await apiClient({
    url: '/home/recommended-influencers',
    method: 'GET',
  })) as RecommendedInfluencer[];
}
