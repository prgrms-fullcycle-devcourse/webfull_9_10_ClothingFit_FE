import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { useGetCloset } from '@/api/generated/endpoints/closet/closet';
import {
  useGetProfile,
  useGetProfileBookmarks,
  useGetProfileRecentPosts,
} from '@/api/generated/endpoints/profile/profile';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { FeedThumbnailItem } from '@/features/feed/components/feed-thumbnail-item';
import { useUnreadNotificationCount } from '@/features/notifications/api';
import { getUserId } from '@/lib/auth-storage';

const ITEM_WIDTH = 150;
const POST_ASPECT = 2 / 3;
const ITEM_HEIGHT = ITEM_WIDTH / POST_ASPECT; // aspect-[2/3]

function EmptySection({ text = '데이터가 존재하지 않습니다.' }: { text?: string }) {
  return (
    <View style={{ height: ITEM_HEIGHT }} className="w-full items-center justify-center">
      <Text variant="caption" className="text-muted">
        {text}
      </Text>
    </View>
  );
}

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

  return (
    <ScreenShell title="마이페이지" showBack={false} noHeader>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text variant="subtitle">마이페이지</Text>
        <View className="flex-row gap-3">
          <Pressable onPress={() => router.push('/(tabs)/profile/notifications')}>
            <Ionicons name="notifications-outline" size={22} />
            {unreadCount > 0 && (
              <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile/settings')}>
            <Ionicons name="settings-outline" size={22} />
          </Pressable>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="px-4 py-4 flex-row gap-4">
          <View className="w-16 h-16 rounded-full bg-surface overflow-hidden">
            {profile?.imageUrl ? (
              <Image source={{ uri: profile.imageUrl }} className="w-full h-full" />
            ) : null}
          </View>
          <View className="flex-1">
            <Pressable
              className="flex-row items-center gap-4"
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <Text variant="subtitle">{profile?.nickname ?? '-'}</Text>
              <FontAwesome name="chevron-circle-right" size={12} color="#111827" />
            </Pressable>
            <Text variant="caption">
              {profile?.height != null ? `${profile.height} cm ` : '- cm '} /{' '}
              {profile?.weight != null ? `${profile.weight} kg ` : '- kg '} /{' '}
              {profile?.gender ?? '성별'}
            </Text>
            <Pressable
              disabled={!myUserId}
              onPress={() => router.push(`/(tabs)/profile/followers?userId=${myUserId}`)}
            >
              <View className="flex-row items-baseline gap-1 mt-1">
                <Text className="font-sans-bold text-base">{profile?.followerCount ?? '-'}</Text>
                <Text variant="caption">팔로워</Text>
                <Text variant="caption" className="mx-1">
                  ·
                </Text>
                <Text className="font-sans-bold text-base">{profile?.followingCount ?? '-'}</Text>
                <Text variant="caption">팔로잉</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Text variant="subtitle" className="px-4 mb-2">
          최근 본 커뮤니티
        </Text>
        {recentPostItems.length === 0 ? (
          <EmptySection text="최근 본 게시물이 없습니다." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {recentPostItems.map((p) => (
              <View key={p.id} className="mr-1">
                <FeedThumbnailItem
                  id={p.id}
                  imageUrl={p.imageUrl}
                  isLiked={p.isLiked}
                  likeCount={p.likeCount}
                  nickname={p.nickname ?? undefined}
                  width={ITEM_WIDTH}
                  aspectRatio={POST_ASPECT}
                  onPress={() => router.push(`/(tabs)/feed/${p.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text variant="subtitle">북마크한 코디</Text>
          <Pressable onPress={() => router.push('/(tabs)/profile/bookmarks')}>
            <Text variant="caption" className="text-primary">
              더 보기
            </Text>
          </Pressable>
        </View>
        {bookmarkItems.length === 0 ? (
          <EmptySection text="북마크한 게시물이 없습니다." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {bookmarkItems.map((p) => (
              <View key={p.id} className="mr-1">
                <FeedThumbnailItem
                  id={p.id}
                  imageUrl={p.imageUrl}
                  isLiked={p.isLiked}
                  likeCount={p.likeCount}
                  nickname={p.nickname ?? undefined}
                  width={ITEM_WIDTH}
                  aspectRatio={POST_ASPECT}
                  icon="none"
                  onPress={() => router.push(`/(tabs)/feed/${p.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        )}
        <View className="flex-row items-center justify-between px-4 mb-2">
          <Text variant="subtitle">내 옷장</Text>
          <Pressable onPress={() => router.navigate('/(tabs)/closet')}>
            <Text variant="caption" className="text-primary">
              더 보기
            </Text>
          </Pressable>
        </View>
        {closetItems.length === 0 ? (
          <EmptySection text="생성된 옷장이 없습니다." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
            {closetItems.map((c) => (
              <View key={c.id} className="mr-1">
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
      </ScrollView>
    </ScreenShell>
  );
}
