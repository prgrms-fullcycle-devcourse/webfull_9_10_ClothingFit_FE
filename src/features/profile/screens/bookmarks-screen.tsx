import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { useBookmarks } from '@/features/profile/api';

export function BookmarksScreen() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookmarks();
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
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 8, flexGrow: 1 }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          renderItem={({ item }) => (
            <Pressable
              className="m-1 flex-1 overflow-hidden rounded-lg"
              onPress={() => router.push(`/(tabs)/feed/${item.id}`)}
            >
              <Image source={{ uri: item.imageUrl }} style={{ aspectRatio: 1 }} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text variant="caption">북마크한 코디가 없어요.</Text>
            </View>
          }
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null}
        />
      )}
    </ScreenShell>
  );
}
