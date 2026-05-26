import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, showBack = true, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-white">
      <View className="flex-row items-center gap-2 flex-1">
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
        ) : (
          <View className="w-6" />
        )}
        <Text variant="subtitle" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ?? <View className="w-6" />}
    </View>
  );
}
