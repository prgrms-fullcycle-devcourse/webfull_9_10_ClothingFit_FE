import { Ionicons } from '@expo/vector-icons';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Switch,
  View,
} from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import {
  NOTIFICATIONS_KEY,
  useClearNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotificationSettings,
  useNotifications,
  useUpdateNotificationSettings,
  type Notification,
  type NotificationsPage,
} from '@/features/notifications/api';
import { SwipeableRow } from '@/features/notifications/components/swipeable-row';
import {
  notificationIcon,
  notificationRoute,
  relativeTime,
} from '@/features/notifications/notification-helpers';

export function NotificationsScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const clearAll = useClearNotifications();
  const settings = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  // 실시간 SSE 구독은 앱 전역(app/(tabs)/_layout)에서 1개만 유지 → 여기선 캐시 갱신만 받음
  const qc = useQueryClient();
  const items = data?.pages.flatMap((p) => p.data) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  // 화면을 열면 "모두 읽음"을 누르지 않아도 자동 읽음 처리(1회).
  // 첫 로딩엔 빨간 점이 보이고, read-all 반영 후 사라진다. 홈 뱃지도 함께 갱신됨.
  const autoMarkedRef = useRef(false);
  useEffect(() => {
    if (!autoMarkedRef.current && unreadCount > 0) {
      autoMarkedRef.current = true;
      markAllRead.mutate();
    }
  }, [unreadCount, markAllRead]);

  // 탭한 알림의 빨간 점을 즉시 제거(로컬 캐시). 서버 읽음 처리는 위 자동 read-all이 담당.
  const markItemReadInCache = (id: string) => {
    qc.setQueriesData<InfiniteData<NotificationsPage>>(
      { queryKey: [...NOTIFICATIONS_KEY, 'list'] },
      (old) =>
        old && {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: p.data.map((d) => (d.id === id ? { ...d, isRead: true } : d)),
          })),
        },
    );
  };

  const handlePress = (item: Notification) => {
    markItemReadInCache(item.id);
    const route = notificationRoute(item);
    if (route) router.push(route);
  };

  const confirmClearAll = () => {
    Alert.alert('전체 삭제', '모든 알림을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '전체 삭제', style: 'destructive', onPress: () => clearAll.mutate() },
    ]);
  };

  return (
    <ScreenShell
      title="알림"
      right={
        unreadCount > 0 ? (
          <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <Text className="font-sans-medium text-primary">모두 읽음</Text>
          </Pressable>
        ) : undefined
      }
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="caption">알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListHeaderComponent={
            <View className="mb-3 flex-row items-center justify-between rounded-xl bg-surface px-4 py-3">
              <Text className="font-sans-medium">푸시 알림 받기</Text>
              <Switch
                value={settings.data?.enabled ?? false}
                disabled={settings.isLoading || updateSettings.isPending}
                onValueChange={(next) => updateSettings.mutate({ data: { enabled: next } })}
              />
            </View>
          }
          renderItem={({ item }) => (
            <SwipeableRow
              onPress={() => handlePress(item)}
              onDelete={() => deleteOne.mutate({ id: item.id })}
              className={`flex-row items-center gap-3 rounded-xl p-4 ${
                item.isRead ? 'bg-surface' : 'border border-border bg-white'
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-surface">
                <Ionicons name={notificationIcon(item.type)} size={18} color="#6a7282" />
              </View>
              <View className="flex-1">
                <Text className={item.isRead ? '' : 'font-sans-medium'}>{item.message}</Text>
                <Text variant="caption">{relativeTime(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View className="h-2 w-2 rounded-full bg-red-500" />}
            </SwipeableRow>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-2 py-20">
              <Ionicons name="notifications-off-outline" size={32} color="#9ca3af" />
              <Text variant="caption">받은 알림이 없어요.</Text>
            </View>
          }
          ListFooterComponent={
            <View className="pt-2">
              {isFetchingNextPage && <ActivityIndicator className="py-3" />}
              {items.length > 0 && (
                <Pressable onPress={confirmClearAll} className="items-center py-3">
                  <Text variant="caption" className="text-red-500">
                    전체 삭제
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </ScreenShell>
  );
}
