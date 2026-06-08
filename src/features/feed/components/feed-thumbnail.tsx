import { router } from 'expo-router';
import { ActivityIndicator, FlatList, View, useWindowDimensions } from 'react-native';

import { PostListItem } from '@/api/generated/schemas';
import { FeedThumbnailItem } from './feed-thumbnail-item';

const NUM_COLUMNS = 3;
const GAP = 1;

type Props = {
  posts: PostListItem[];
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
};

export function FeedThumbnail({
  posts,
  onEndReached,
  isLoadingMore,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      className="flex-1"
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <FeedThumbnailItem
          id={item.id}
          imageUrl={item.imageUrl}
          isLiked={item.isLiked}
          likeCount={item.likeCount}
          nickname={item.nickname ?? undefined}
          width={itemWidth}
          onPress={() => router.push(`/feed/${item.id}`)}
        />
      )}
    />
  );
}
