import { FlatList, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/ui/text';

import { router } from 'expo-router';
import { FeedThumbnailItem } from './feed-thumbnail-item';

type Post = {
  id: string;
  imageUrl: string;
  likeCount: number;
  isLiked: boolean;
};

type Props = {
  posts: Post[];
};

export function OtherPosts({ posts }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth * 0.3;

  if (posts.length === 0) {
    return (
      <View className="px-4 py-6 items-center">
        <Text variant="caption" className="text-md">
          스타일이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={posts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingLeft: 16, gap: 1 }}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <FeedThumbnailItem
          id={item.id}
          imageUrl={item.imageUrl}
          isLiked={item.isLiked}
          likeCount={item.likeCount}
          width={itemWidth}
          onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: item.id } })}
        />
      )}
    />
  );
}
