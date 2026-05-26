import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const STEPS = ['배경 제거 중…', '의류 합성 중…', '2D 모델 생성 중…', '완료'];

export function FittingJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), (i + 1) * 1200),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const done = step >= STEPS.length - 1;

  return (
    <ScreenShell title="피팅 진행">
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text variant="caption">job: {jobId}</Text>
        <Text variant="title">{STEPS[Math.min(step, STEPS.length - 1)]}</Text>
        <View className="w-full h-2 bg-surface rounded-full overflow-hidden">
          <View
            className="h-full bg-accent"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </View>
        <Text variant="caption">mock SSE — react-native-sse TODO</Text>
        {done && (
          <Button label="결과 보기" onPress={() => router.replace('/(tabs)/fitting/result')} />
        )}
      </View>
    </ScreenShell>
  );
}
