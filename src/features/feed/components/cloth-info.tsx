import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  brand: string;
  name: string;
};

export function ClothInfo({ brand, name }: Props) {
  return (
    <View className="mx-4 mb-2 rounded-xl border border-border flex-row">
      <View className="w-24 h-24 bg-surface rounded-l-xl mr-3" />
      <View className="flex-1 flex-row justify-between items-center px-5">
        <View className="flex-col gap-2">
          <Text className="font-sans-medium">{brand}</Text>
          <Text variant="caption">{name}</Text>
        </View>
        <Ionicons name="open-outline" size={24} color="black" />
      </View>
    </View>
  );
}
