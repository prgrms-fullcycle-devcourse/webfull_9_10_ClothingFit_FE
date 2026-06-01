import { Pressable, View } from 'react-native';

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

export function Toggle({
  labelRight,
  labelLeft,
  value,
  onValueChange,
  disabled,
  className,
}: Props) {
  return (
    <View className={cn('flex-row items-center gap-2', disabled && 'opacity-40', className)}>
      <Text className={cn('text-sm font-sans-medium', !value ? 'text-accent' : 'text-muted')}>
        {labelLeft}
      </Text>
      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        className={cn(
          'flex-row items-center px-1 py-1 rounded-full w-12 h-8',
          value ? 'bg-accent' : 'bg-surface',
        )}
      >
        <View className={cn('w-5 h-5 rounded-full', value ? 'bg-white ml-auto' : 'bg-white')} />
      </Pressable>
      <Text className={cn('text-sm font-sans-medium', value ? 'text-accent' : 'text-muted')}>
        {labelRight}
      </Text>
    </View>
  );
}
