import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_POSTS } from '@/mocks/data';

export function BookmarksScreen() {
  return (
    <ScreenShell title="북마크한 코디">
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <Pressable
            className="flex-1 m-1 rounded-lg overflow-hidden"
            onPress={() => router.push(`/(tabs)/feed/${item.id}`)}>
            <View style={{ aspectRatio: 1, backgroundColor: item.imageColor }} />
            <Text variant="caption" className="p-1">
              {item.nickname}
            </Text>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
