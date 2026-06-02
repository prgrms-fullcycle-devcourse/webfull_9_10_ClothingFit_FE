import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

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
        selected ? 'border-primary bg-primary' : 'border-border bg-surface'
      }`}
    >
      <Text className={`font-sans text-sm ${selected ? 'text-white' : 'text-muted'}`}>{text}</Text>
      {menuArrow && (
        <Ionicons name="chevron-down" size={14} color={selected ? '#ffffff' : '#6a7282'} />
      )}
    </Pressable>
  );
}
