import { PlaceholderScreen } from '@/components/blocks/placeholder-screen';
import { useLocalSearchParams } from 'expo-router';

export default function FeedPostRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  return <PlaceholderScreen title="게시물 상세" description={`담당: 양희진 (post: ${postId ?? '-'})`} />;
}
