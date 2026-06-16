import { Pressable, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import COLORS from '@/constants/colors';
import { cn } from '@/utils/cn';

import { Text } from './text';

type Props = {
  labelRight: string;
  labelLeft: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
};

// 트랙(48) - 좌우 보더(1*2) - 좌우 패딩(4*2) = 38, 노브(20) → 이동 거리 18px
const KNOB_TRAVEL = 18;
const DURATION = 180;

export function Toggle({
  labelRight,
  labelLeft,
  value,
  onValueChange,
  disabled,
  className,
}: Props) {
  // value 변화에 맞춰 0↔1로 부드럽게 보간 → 노브 슬라이드 + 배경색 전환
  const progress = useDerivedValue(
    () => withTiming(value ? 1 : 0, { duration: DURATION }),
    [value],
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [COLORS.border, COLORS.accent]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * KNOB_TRAVEL }],
  }));

  return (
    <View className={cn('flex-row items-center gap-2', disabled && 'opacity-40', className)}>
      <Text className={cn('text-sm font-sans-medium', !value ? 'text-accent' : 'text-muted')}>
        {labelLeft}
      </Text>
      <Pressable onPress={() => !disabled && onValueChange(!value)} disabled={disabled}>
        <Animated.View
          style={[
            {
              width: 48,
              height: 32,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: 'rgba(153, 161, 175, 0.3)', // slate 30% — 옅은 아웃라인
              paddingHorizontal: 4,
              justifyContent: 'center',
            },
            trackStyle,
          ]}
        >
          <Animated.View
            style={[
              { width: 20, height: 20, borderRadius: 999, backgroundColor: '#ffffff' },
              knobStyle,
            ]}
          />
        </Animated.View>
      </Pressable>
      <Text className={cn('text-sm font-sans-medium', value ? 'text-accent' : 'text-muted')}>
        {labelRight}
      </Text>
    </View>
  );
}
