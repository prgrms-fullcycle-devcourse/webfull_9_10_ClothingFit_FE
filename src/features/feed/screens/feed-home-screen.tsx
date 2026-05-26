import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MOCK_POSTS } from '@/mocks/data';

export function FeedHomeScreen() {
  return (
    <ScreenShell title="커뮤니티" showBack={false}>
      <View className="flex-row px-4 py-2 gap-2">
        <Button label="추천" className="flex-1 py-2" />
        <Button label="팔로잉" variant="ghost" className="flex-1 py-2" />
      </View>
      <View className="flex-row px-4 pb-2 gap-2">
        <Text variant="caption" className="px-2 py-1 bg-surface rounded-lg">
          성별
        </Text>
        <Text variant="caption" className="px-2 py-1 bg-surface rounded-lg">
          키/몸무게
        </Text>
        <Text variant="caption" className="px-2 py-1 bg-surface rounded-lg">
          최신순
        </Text>
      </View>
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 8 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            className="flex-1 mb-2 rounded-lg overflow-hidden"
            style={{ maxWidth: '33%' }}
            onPress={() => router.push(`/(tabs)/feed/${item.id}`)}>
            <View style={{ aspectRatio: 1, backgroundColor: item.imageColor }} />
            <View className="p-1">
              <Text variant="caption" numberOfLines={1}>
                {item.nickname}
              </Text>
              <Text variant="caption">♥ {item.likes}</Text>
            </View>
          </Pressable>
        )}
      />
      <Pressable
        className="absolute bottom-6 right-6 bg-accent w-14 h-14 rounded-full items-center justify-center"
        onPress={() => router.push('/(tabs)/feed/create')}>
        <Text className="text-white text-2xl font-sans">+</Text>
      </Pressable>
    </ScreenShell>
  );
}
