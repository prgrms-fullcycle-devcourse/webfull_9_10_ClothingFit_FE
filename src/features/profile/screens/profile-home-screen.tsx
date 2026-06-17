import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BASE_HEIGHT } from '@/constants/tab-bar';
import { useTabBarScroll } from '@/features/navigation/use-tab-bar-scroll';

import { useGetCloset } from '@/api/generated/endpoints/closet/closet';
import {
  useGetProfile,
  useGetProfileBookmarks,
  useGetProfileRecentPosts,
} from '@/api/generated/endpoints/profile/profile';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';
import { Text } from '@/components/ui/text';
import { FeedThumbnailItem } from '@/features/feed/components/feed-thumbnail-item';
import { useUnreadNotificationCount } from '@/features/notifications/api';
import { getUserId } from '@/lib/auth-storage';

const ITEM_WIDTH = 150;
const POST_ASPECT = 2 / 3;
const ITEM_HEIGHT = ITEM_WIDTH / POST_ASPECT; // aspect-[2/3]

export function ProfileHomeScreen() {
  const [myUserId, setMyUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getUserId().then(setMyUserId);
  }, []);

  const {
    data: profile,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useGetProfile();
  const {
    data: recentPosts,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = useGetProfileRecentPosts();
  const {
    data: bookmarks,
    refetch: refetchBookmarks,
    isRefetching: isRefetchingBookmarks,
  } = useGetProfileBookmarks();
  const {
    data: closetData,
    refetch: refetchCloset,
    isRefetching: isRefetchingCloset,
  } = useGetCloset();

  const isRefreshing =
    isRefetchingProfile || isRefetchingPosts || isRefetchingBookmarks || isRefetchingCloset;
  const handleRefresh = () => {
    refetchProfile();
    refetchPosts();
    refetchBookmarks();
    refetchCloset();
  };
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const recentPostItems = recentPosts?.data?.slice(0, 10) ?? [];
  const bookmarkItems = bookmarks?.data?.slice(0, 10) ?? [];
  const closetItems = closetData?.data?.slice(0, 10) ?? [];

  const insets = useSafeAreaInsets();
  const scrollHandler = useTabBarScroll();

  return (
    <ScreenShell title="마이페이지" showBack={false} noHeader>
      <View className="z-10 flex-row items-center justify-between bg-white pl-5 pr-4 py-3">
        <Text variant="title" className="text-2xl">
          마이페이지
        </Text>
        <View className="flex-row gap-3">
          <Pressable onPress={() => router.push('/(tabs)/profile/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
            {unreadCount > 0 && (
              <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile/settings')}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </Pressable>
        </View>
      </View>
      <Animated.ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom }}
      >
        <View className="px-10 py-6 flex-row items-center gap-4">
          <View className="w-20 h-20 rounded-full bg-surface overflow-hidden">
            {profile?.imageUrl ? (
              <Image source={{ uri: profile.imageUrl }} className="w-full h-full" />
            ) : null}
          </View>
          <View className="flex-1 flex-col gap-[0.25rem]">
            <Pressable
              className="flex-row items-center gap-4"
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <Text className="font-sans-bold text-xl" variant="subtitle">
                {profile?.nickname ?? '-'}
              </Text>
              <FontAwesome name="chevron-circle-right" size={14} color="#99a1af" />
            </Pressable>
            <Text
              variant="caption"
              className="text-md" /*leading-none"*/
              style={{ lineHeight: 20, includeFontPadding: false, marginVertical: -2 }}
            >
              {profile?.height != null ? `${profile.height} cm ` : '- cm '} /{' '}
              {profile?.weight != null ? `${profile.weight} kg ` : '- kg '} /{' '}
              {({ MALE: '남성', FEMALE: '여성' } as Record<string, string>)[
                profile?.gender ?? ''
              ] ?? '성별'}
            </Text>
            <View className="flex-row items-baseline gap-4">
              <Pressable
                disabled={!myUserId}
                className="flex-row items-baseline gap-1"
                onPress={() =>
                  router.push({
                    pathname: '/followers',
                    params: {
                      userId: myUserId ?? '',
                      tab: 'followers',
                      nickname: profile?.nickname,
                    },
                  })
                }
              >
                <Text className="font-sans-bold text-lg">{profile?.followerCount ?? '-'}</Text>
                <Text
                  variant="caption"
                  className="text-md text-muted"
                  style={{ lineHeight: 20, includeFontPadding: false, marginVertical: -2 }}
                >
                  팔로워
                </Text>
              </Pressable>

              <Pressable
                disabled={!myUserId}
                className="flex-row items-baseline gap-1"
                onPress={() =>
                  router.push({
                    pathname: '/followers',
                    params: {
                      userId: myUserId ?? '',
                      tab: 'following',
                      nickname: profile?.nickname,
                    },
                  })
                }
              >
                <Text className="font-sans-bold text-lg">{profile?.followingCount ?? '-'}</Text>
                <Text
                  variant="caption"
                  className="text-md text-muted"
                  style={{ lineHeight: 20, includeFontPadding: false, marginVertical: -2 }}
                >
                  팔로잉
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Divider thickness={1} className="bg-surface" />
        <Text variant="subtitle" className="font-sans-bold text-xl px-4 mt-4 mb-2">
          최근 본 커뮤니티
        </Text>
        {recentPostItems.length === 0 ? (
          <EmptyState
            icon={<FontAwesome name="inbox" size={42} color="#e6e6e6" />}
            title="최근 본 게시물이 없습니다."
            style={{ height: ITEM_HEIGHT }}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {recentPostItems.map((p) => (
              <View key={p.id} className="mr-px">
                <FeedThumbnailItem
                  id={p.id}
                  imageUrl={p.imageUrl}
                  isLiked={p.isLiked}
                  likeCount={p.likeCount}
                  nickname={p.nickname ?? undefined}
                  width={ITEM_WIDTH}
                  aspectRatio={POST_ASPECT}
                  onPress={() =>
                    router.push({ pathname: '/post/[postId]', params: { postId: p.id } })
                  }
                />
              </View>
            ))}
          </ScrollView>
        )}

        <Divider thickness={1} className="bg-surface" />
        <View className="flex-row items-end justify-between px-4 mt-4 mb-2">
          <Text className="font-sans-bold text-xl" variant="subtitle">
            북마크한 코디
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/profile/bookmarks')}>
            <Text variant="caption" className="font-sans-bold text-slate text-md leading-none">
              더 보기
            </Text>
          </Pressable>
        </View>
        {bookmarkItems.length === 0 ? (
          <EmptyState
            icon={<FontAwesome name="inbox" size={42} color="#e6e6e6" />}
            title="북마크한 게시물이 없습니다."
            style={{ height: ITEM_HEIGHT }}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {bookmarkItems.map((p) => (
              <View key={p.id} className="mr-px">
                <FeedThumbnailItem
                  id={p.id}
                  imageUrl={p.imageUrl}
                  isLiked={p.isLiked}
                  likeCount={p.likeCount}
                  nickname={p.nickname ?? undefined}
                  width={ITEM_WIDTH}
                  aspectRatio={POST_ASPECT}
                  icon="none"
                  onPress={() =>
                    router.push({ pathname: '/post/[postId]', params: { postId: p.id } })
                  }
                />
              </View>
            ))}
          </ScrollView>
        )}
        <Divider thickness={1} className="bg-surface" />
        <View className="flex-row items-end justify-between px-4 mt-4 mb-2">
          <Text className="font-sans-bold text-xl" variant="subtitle">
            내 옷장
          </Text>
          <Pressable onPress={() => router.navigate('/(tabs)/closet')}>
            <Text variant="caption" className="font-sans-bold text-slate text-md leading-none">
              더 보기
            </Text>
          </Pressable>
        </View>
        {closetItems.length === 0 ? (
          <EmptyState
            icon={<FontAwesome name="inbox" size={42} color="#e6e6e6" />}
            title="생성된 옷장이 없습니다."
            style={{ height: ITEM_HEIGHT }}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {closetItems.map((c) => (
              <View key={c.id} className="mr-px">
                <FeedThumbnailItem
                  id={c.id}
                  imageUrl={c.imageUrl}
                  isLiked={false}
                  likeCount={0}
                  width={ITEM_WIDTH}
                  aspectRatio={POST_ASPECT}
                  icon="none"
                  onPress={() => router.push(`/(tabs)/closet/${c.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.ScrollView>
    </ScreenShell>
  );
}
