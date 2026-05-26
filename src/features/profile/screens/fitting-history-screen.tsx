import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_CLOSET_ITEMS } from '@/mocks/data';

export function FittingHistoryScreen() {
  return (
    <ScreenShell title="피팅 기록">
      <FlatList
        data={MOCK_CLOSET_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            className="mb-3 p-4 rounded-xl border border-border flex-row items-center"
            onPress={() => router.push(`/(tabs)/closet/${item.id}`)}>
            <View className="w-16 h-20 rounded-lg mr-3" style={{ backgroundColor: item.color }} />
            <View>
              <Text className="font-sans-medium">{item.name}</Text>
              <Text variant="caption">{item.createdAt}</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
