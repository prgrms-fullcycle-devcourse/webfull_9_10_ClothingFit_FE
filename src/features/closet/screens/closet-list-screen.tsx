import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_CLOSET_ITEMS } from '@/mocks/data';

export function ClosetListScreen() {
  return (
    <ScreenShell title="나의 옷장" showBack={false}>
      <FlatList
        data={MOCK_CLOSET_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            className="mb-4 flex-row rounded-2xl border border-border p-3"
            onPress={() => router.push(`/(tabs)/closet/${item.id}`)}>
            <View
              className="w-24 h-32 rounded-xl mr-3"
              style={{ backgroundColor: item.color }}
            />
            <View className="flex-1 justify-center">
              {item.is3d && (
                <View className="self-start bg-primary px-2 py-0.5 rounded mb-1">
                  <Text className="text-white text-xs font-sans-medium">3D</Text>
                </View>
              )}
              <Text className="font-sans-medium">{item.name}</Text>
              <Text variant="caption">{item.createdAt}</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
