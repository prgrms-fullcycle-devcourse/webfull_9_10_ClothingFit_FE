import { PlaceholderScreen } from '@/components/blocks/placeholder-screen';
import { useLocalSearchParams } from 'expo-router';

export default function FittingJobRoute() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  return (
    <PlaceholderScreen
      title="피팅 진행"
      description={`SSE 진행 화면 (job: ${jobId ?? '-'})`}
    />
  );
}
