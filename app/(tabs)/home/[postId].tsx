import { FeedPostDetailScreen } from '@/features/feed/screens/feed-post-detail-screen';

/** 라우트: 홈 탭에서 연 게시글 상세. 홈 스택에 push되어 뒤로가기 시 홈으로 돌아간다. */
export default function HomePostDetailRoute() {
  return <FeedPostDetailScreen />;
}
