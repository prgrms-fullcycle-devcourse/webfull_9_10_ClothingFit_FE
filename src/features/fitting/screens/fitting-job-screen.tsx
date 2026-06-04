import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useFittingJob } from '@/features/fitting/store/fitting-job-store';

const STEPS = ['배경 제거 중…', '의류 합성 중…', '2D 모델 생성 중…'];

export function FittingJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = useFittingJob(jobId);
  const [tick, setTick] = useState(0);

  const status = job?.status;
  useEffect(() => {
    if (status !== 'pending') return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  if (!job) {
    return (
      <ScreenShell title="피팅 진행">
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Text variant="caption">작업을 찾을 수 없어요.</Text>
          <Button label="홈으로" onPress={() => router.replace('/(tabs)/fitting')} />
        </View>
      </ScreenShell>
    );
  }

  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';
  const stepIdx = isDone ? STEPS.length : Math.min(tick, STEPS.length - 1);
  const progress = isDone ? 1 : (stepIdx + 1) / (STEPS.length + 1);

  return (
    <ScreenShell title="피팅 진행">
      <View className="flex-1 items-center justify-center px-6 gap-4">
        {isFailed ? (
          <>
            <Text variant="title">생성 실패</Text>
            <Text variant="caption">{job.error ?? '다시 시도해주세요'}</Text>
            <Button label="돌아가기" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <Text variant="title">{isDone ? '완료' : STEPS[stepIdx]}</Text>
            <View className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <View className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
            </View>
            <Text variant="caption" className="text-center">
              {isDone
                ? '아바타가 완성됐어요!'
                : '생성 중에는 다른 화면으로 이동해도 돼요.\n완료되면 상단 알림으로 알려드릴게요.'}
            </Text>
            {isDone && (
              <Button
                label="결과 보기"
                onPress={() =>
                  router.replace({
                    pathname: '/(tabs)/fitting/result',
                    params: { jobId: job.id },
                  })
                }
              />
            )}
          </>
        )}
      </View>
    </ScreenShell>
  );
}
