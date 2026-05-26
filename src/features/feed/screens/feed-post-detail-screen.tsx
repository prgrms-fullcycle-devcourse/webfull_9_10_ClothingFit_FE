import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_POSTS, MOCK_USER, MOCK_WORN_PRODUCTS } from '@/mocks/data';

export function FeedPostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const post = MOCK_POSTS.find((p) => p.id === postId) ?? MOCK_POSTS[0];

  return (
    <ScreenShell title="게시물">
      <ScrollView className="flex-1">
        <View className="px-4 py-3 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-surface" />
          <View>
            <Text className="font-sans-medium">{MOCK_USER.nickname}</Text>
            <Text variant="caption">
              {MOCK_USER.height}cm · {MOCK_USER.weight}kg · {MOCK_USER.gender}
            </Text>
          </View>
        </View>
        <View style={{ height: 400, backgroundColor: post.imageColor }} />
        <View className="flex-row px-4 py-3 gap-4">
          <Text>♥ {post.likes}</Text>
          <Text>북마크</Text>
          <Text>공유</Text>
        </View>
        <Text variant="subtitle" className="px-4 mb-2">
          착용 제품
        </Text>
        {MOCK_WORN_PRODUCTS.map((p) => (
          <View key={p.id} className="mx-4 mb-2 p-3 rounded-xl border border-border flex-row">
            <View className="w-12 h-12 bg-surface rounded-lg mr-3" />
            <View>
              <Text className="font-sans-medium">{p.brand}</Text>
              <Text variant="caption">{p.name}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
