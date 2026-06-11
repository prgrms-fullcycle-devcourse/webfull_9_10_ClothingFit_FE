import { router } from 'expo-router';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

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
  onRefresh?: () => void;
  refreshing?: boolean;
  /** 탭바 스크롤 숨김 핸들러 (reanimated) */
  onScroll?: React.ComponentProps<typeof Animated.FlatList>['onScroll'];
  /** 콘텐츠 하단 패딩 (floating 탭바 높이) */
  bottomInset?: number;
};

export function FeedThumbnail({
  posts,
  onEndReached,
  isLoadingMore,
  ListHeaderComponent,
  ListEmptyComponent,
  onRefresh,
  refreshing,
  onScroll,
  bottomInset = 0,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <Animated.FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLUMNS}
      className="flex-1"
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP, paddingBottom: bottomInset }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      onRefresh={onRefresh}
      refreshing={refreshing ?? false}
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
