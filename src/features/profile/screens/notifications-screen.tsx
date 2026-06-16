import { Ionicons } from '@expo/vector-icons';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import {
  NOTIFICATIONS_KEY,
  useClearNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications,
  type Notification,
  type NotificationsPage,
} from '@/features/notifications/api';
import { SwipeableRow, closeActiveSwipe } from '@/features/notifications/components/swipeable-row';
import { notificationRoute, relativeTime } from '@/features/notifications/notification-helpers';

/** 처음에 보여줄 알림 개수 (이후 "더보기"로 펼침) */
const INITIAL_COUNT = 4;

/** 메시지 안의 닉네임만 파란색으로 강조 */
function NotiMessage({
  message,
  nickname,
  isRead,
}: {
  message: string;
  nickname: string | null;
  isRead: boolean;
}) {
  if (!nickname || !message.includes(nickname)) {
    return <Text className="font-sans-extrabold text-lg">{message}</Text>;
  }
  const idx = message.indexOf(nickname);
  return (
    <Text className="font-sans-extrabold text-lg">
      {message.slice(0, idx)}
      <Text className="font-sans-extrabold text-lg leading-[2.1rem]" style={{ color: '#2563eb' }}>
        {nickname}
      </Text>
      {message.slice(idx + nickname.length)}
    </Text>
  );
}

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

  const qc = useQueryClient();
  const items = data?.pages.flatMap((p) => p.data) ?? [];
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  // 처음엔 4개만, "더보기"로 펼친다.
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, INITIAL_COUNT);

  // 화면을 떠날 때 열려있던 스와이프 닫기 (다시 들어오면 아무 일 없던 것처럼)
  useFocusEffect(
    useCallback(() => {
      return () => closeActiveSwipe();
    }, []),
  );

  // 화면을 열면 자동 읽음 처리(1회).
  const autoMarkedRef = useRef(false);
  useEffect(() => {
    if (!autoMarkedRef.current && unreadCount > 0) {
      autoMarkedRef.current = true;
      markAllRead.mutate();
    }
  }, [unreadCount, markAllRead]);

  // 탭한 알림의 빨간 점을 즉시 제거(로컬 캐시).
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

  // 확인창 없이 바로 전체 삭제
  const handleClearAll = () => clearAll.mutate();

  return (
    <ScreenShell noHeader>
      {/* 헤더 — 홈 헤더와 같은 크기로 통일 */}
      <View className="flex-row items-center gap-1 border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </Pressable>
        <Text variant="title">알림</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="caption">알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      ) : (
        <>
          {/* 상단 우측: 알림 전체 삭제 */}
          {items.length > 0 && (
            <Pressable onPress={handleClearAll} className="items-end mr-10 mt-3 mb-2">
              <Text className="text-md text-red-500 font-sans-bold text-warning">
                알림 전체 삭제
              </Text>
            </Pressable>
          )}

          <FlatList
            data={visibleItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 24, flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            renderItem={({ item }) => {
              const actorImage =
                (item.actor as { imageUrl?: string | null } | null)?.imageUrl ?? null;
              const nickname = item.actor?.nickname ?? null;
              return (
                <SwipeableRow
                  onPress={() => handlePress(item)}
                  onDelete={() => deleteOne.mutate({ id: item.id })}
                  className={`rounded-[1.5rem] pt-6 px-7 mt-1 ${
                    item.isRead ? 'bg-[#E6E6E6]' : 'border border-border'
                  }`}
                >
                  {/* 안읽음: 흰→연회색 세로 그라데이션 배경 (rounded-2xl = 16px) */}
                  {!item.isRead && (
                    <LinearGradient
                      colors={['#FFFFFF', '#F9FAFB']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[StyleSheet.absoluteFill, { borderRadius: 19 }]}
                    />
                  )}
                  {/* 안읽음: 좌상단 빨간 점 */}
                  {!item.isRead && (
                    <View className="absolute left-[-0.1rem] top-[-0.17rem] h-2 w-2 bg-warning rounded-full" />
                  )}
                  <View className="flex-row items-center gap-6">
                    <View className="flex-1 justify-center pb-6">
                      <NotiMessage
                        message={item.message}
                        nickname={nickname}
                        isRead={item.isRead}
                      />
                    </View>
                    <View className="items-end">
                      {/* 우측: 알림 발생 유저 사진 (좋아요/팔로우 등) */}
                      {actorImage ? (
                        <Image
                          source={{ uri: actorImage }}
                          style={{ width: 68, height: 68, borderRadius: 2 }}
                        />
                      ) : null}
                      <Text
                        variant="caption"
                        className="mt-1 pb-3 text-right text-slate font-sans-medium"
                      >
                        {relativeTime(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                </SwipeableRow>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center gap-2 py-20">
                <Ionicons name="notifications-off-outline" size={32} color="#9ca3af" />
                <Text variant="caption">받은 알림이 없어요.</Text>
              </View>
            }
            ListFooterComponent={
              <View className="pt-1">
                {!expanded && items.length > INITIAL_COUNT ? (
                  <Pressable onPress={() => setExpanded(true)} className="items-center py-3">
                    <Text className="font-sans-extrabold text-lg text-primary">더보기</Text>
                  </Pressable>
                ) : isFetchingNextPage ? (
                  <ActivityIndicator className="py-3" />
                ) : expanded && hasNextPage ? (
                  <Pressable onPress={() => fetchNextPage()} className="items-center py-3">
                    <Text className="font-sans-extrabold text-lg text-primary">더보기</Text>
                  </Pressable>
                ) : null}
              </View>
            }
          />
        </>
      )}
    </ScreenShell>
  );
}
