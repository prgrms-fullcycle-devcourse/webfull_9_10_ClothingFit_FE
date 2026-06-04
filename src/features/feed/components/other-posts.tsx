import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Text } from '@/components/ui/text';

import { OtherPostCard } from './other-post-card';

type Post = {
  id: string;
  imageUrl: string;
  likeCount: number;
  isLiked: boolean;
};

type Props = {
  posts: Post[];
};

const PADDING_LEFT = 16;

export function OtherPosts({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <View className="px-4 py-6 items-center">
        <Text variant="caption">스타일이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingLeft: PADDING_LEFT }}
      decelerationRate="fast"
      renderItem={({ item }) => (
        <OtherPostCard
          imageUrl={item.imageUrl}
          likeCount={item.likeCount}
          isLiked={item.isLiked}
          onPress={() => router.push(`/(tabs)/feed/${item.id}`)}
        />
      )}
    />
  );
}
