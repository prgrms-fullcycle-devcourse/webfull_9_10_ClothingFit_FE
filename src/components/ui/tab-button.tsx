import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
};

export function TabButton({ label, selected, onPress, className }: Props) {
  return (
    <Pressable onPress={onPress} className={cn('pb-2 items-center', className)}>
      <Text className={`font-sans-medium text-2xl ${selected ? 'text-primary' : 'text-muted'}`}>
        {label}
      </Text>
      {selected && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
    </Pressable>
  );
}
