import { useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MOCK_POSTS, MOCK_USER } from '@/mocks/data';

export function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <ScreenShell title={MOCK_USER.nickname}>
      <View className="px-4 py-4 flex-row gap-4 items-center">
        <View className="w-16 h-16 rounded-full bg-surface" />
        <View className="flex-1">
          <Text variant="subtitle">{MOCK_USER.nickname}</Text>
          <Text variant="caption">
            {MOCK_USER.height}cm · {MOCK_USER.weight}kg
          </Text>
          <Text variant="caption">user: {userId}</Text>
        </View>
        <Button label="팔로우" className="px-4 py-2" />
      </View>
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <Pressable className="flex-1 m-1">
            <View style={{ aspectRatio: 1, backgroundColor: item.imageColor }} />
            <Text variant="caption" className="p-1">
              ♥ {item.likes}
            </Text>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
