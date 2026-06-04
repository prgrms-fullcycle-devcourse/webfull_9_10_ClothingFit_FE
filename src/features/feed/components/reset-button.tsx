import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Pressable } from 'react-native';

type Props = {
  onPress: () => void;
};

export function ResetButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border border-surface flex items-center justify-center p-2"
    >
      <SimpleLineIcons name="refresh" size={12} color="#6a7282" />
    </Pressable>
  );
}
