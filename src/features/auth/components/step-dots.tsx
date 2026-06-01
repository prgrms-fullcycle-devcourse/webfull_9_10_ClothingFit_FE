import { View } from 'react-native';

import { STEPS, type Step } from '@/features/auth/constants/steps';
import { cn } from '@/utils/cn';

export function StepDots({ step }: { step: Step }) {
  // 아바타 선택 단계에서 사용
  return (
    <View className="flex-row gap-2">
      {STEPS.map((s) => (
        <View
          key={s}
          className={cn('w-2.5 h-2.5 rounded-full', step === s ? 'bg-muted' : 'bg-border')}
        />
      ))}
    </View>
  );
}
