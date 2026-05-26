import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_POPULAR_USERS, MOCK_POSTS } from '@/mocks/data';

export function HomeScreen() {
  return (
    <ScreenShell title="CLOTHING-FIT" showBack={false} noHeader>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text variant="subtitle">CLOTHING-FIT</Text>
        <Pressable onPress={() => router.push('/(tabs)/profile/notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </Pressable>
      </View>
      <ScrollView className="flex-1">
        <Text variant="subtitle" className="px-4 pt-4 pb-2">
          인기글
        </Text>
        <View className="px-4 pb-4">
          {MOCK_POSTS.slice(0, 3).map((post) => (
            <Pressable
              key={post.id}
              className="mb-4 rounded-2xl overflow-hidden border border-border"
              onPress={() => router.push(`/(tabs)/feed/${post.id}`)}>
              <View style={{ height: 200, backgroundColor: post.imageColor }} />
              <View className="p-3">
                <Text variant="caption">{post.nickname}</Text>
                <Text variant="caption">{post.createdAt}</Text>
                <Text className="font-sans-medium">♥ {post.likes}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Text variant="subtitle" className="px-4 pb-2">
          인기 팔로워
        </Text>
        <FlatList
          horizontal
          data={MOCK_POPULAR_USERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              className="mr-3 w-28 rounded-xl border border-border p-2"
              onPress={() => router.push(`/(tabs)/profile/user/${item.id}`)}>
              <View className="h-20 rounded-lg bg-surface mb-2" />
              <Text variant="caption" numberOfLines={1}>
                {item.nickname}
              </Text>
              <Text variant="caption">{item.followers} 팔로워</Text>
              <View className="mt-2 bg-primary rounded-lg py-1">
                <Text className="text-white text-center text-xs font-sans-medium">팔로우</Text>
              </View>
            </Pressable>
          )}
        />
      </ScrollView>
    </ScreenShell>
  );
}
