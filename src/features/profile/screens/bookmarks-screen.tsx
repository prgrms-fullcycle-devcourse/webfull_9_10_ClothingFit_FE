import { FontAwesome } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Text } from '@/components/ui/text';
import { FeedThumbnail } from '@/features/feed/components/feed-thumbnail';
import { useBookmarks } from '@/features/profile/api';

/** 북마크한 코디 목록 화면. GET /profile/bookmarks를 커서 페이지네이션으로 그리드 표시한다. */
export function BookmarksScreen() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useBookmarks();
  const items = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ScreenShell title="북마크한 코디">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="caption">목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      ) : (
        <FeedThumbnail
          posts={items}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          isLoadingMore={isFetchingNextPage}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <EmptyState
              icon={<FontAwesome name="bookmark-o" size={48} color="#e6e6e6" />}
              title="북마크한 코디가 없어요"
            />
          }
        />
      )}
    </ScreenShell>
  );
}
