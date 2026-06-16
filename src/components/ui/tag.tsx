import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  text: string;
  onPress?: () => void;
  menuArrow?: boolean;
  selected?: boolean;
};

export function Tag({ text, onPress, menuArrow, selected }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1 self-start rounded-full border px-3 py-1.5 ${
        selected ? 'border-primary' : 'border-border'
      }`}
    >
      <Text
        className={`font-sans text-md leading-normal ${selected ? 'text-primary' : 'text-muted'}`}
      >
        {text}
      </Text>
      {menuArrow && (
        <Ionicons name="chevron-down" size={14} color={selected ? '#111827' : '#6a7282'} />
      )}
    </Pressable>
  );
}
