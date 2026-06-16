import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useGetUsersId } from '@/api/generated/endpoints/users/users';
import { useUserPostsInfinite } from '@/features/feed/hooks/use-user-posts-infinite';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { Text } from '@/components/ui/text';
import { FeedThumbnail } from '@/features/feed/components/feed-thumbnail';
import { FollowButton } from '@/features/feed/components/follow-button';
import { useUserFollow } from '@/features/feed/hooks/use-user-follow';
import { getUserId } from '@/lib/auth-storage';
import { ProfileHeader } from '../components/profile-header';

export function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [myUserId, setMyUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getUserId().then(setMyUserId);
  }, []);

  const isMe = !!myUserId && myUserId === userId;

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
    isRefetching: isRefetchingProfile,
  } = useGetUsersId(userId, {
    query: { enabled: !!userId },
  });
  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPostsInfinite(userId);
  const { isFollowing, toggle } = useUserFollow({
    userId,
    isFollowing: profile?.isFollowing ?? false,
  });

  if (profileLoading) {
    return (
      <ScreenShell title="프로필" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenShell>
    );
  }

  if (profileError || !profile) {
    return (
      <ScreenShell title="프로필" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center gap-2">
          <Ionicons name="alert-circle-outline" size={48} color="#888" />
          <Text variant="caption">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      </ScreenShell>
    );
  }

  const postsEmptyComponent = postsLoading ? (
    <View className="py-12 items-center">
      <ActivityIndicator />
    </View>
  ) : postsError ? (
    <View className="py-12 items-center gap-2">
      <Ionicons name="alert-circle-outline" size={78} color="#e6e6e6" />
      <Text variant="caption">게시물을 불러오지 못했습니다.</Text>
    </View>
  ) : (
    <View className="py-12">
      <EmptyState
        icon={<FontAwesome name="inbox" size={60} color="#e6e6e6" />}
        title="작성된 게시물이 없습니다"
      />
    </View>
  );

  const profileHeader = (
    <ProfileHeader
      nickname={profile.nickname ?? ''}
      imageUrl={profile.imageUrl}
      action={
        <View className={isMe ? 'opacity-0' : undefined}>
          <FollowButton isFollowing={isFollowing} onPress={isMe ? () => {} : toggle} />
        </View>
      }
    >
      <View className="flex-row gap-4 mt-1">
        <Text variant="caption">게시물 {profile.postCount ?? 0}</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/followers',
              params: { userId, tab: 'followers', nickname: profile.nickname },
            })
          }
        >
          <Text variant="caption">팔로워 {profile.followerCount ?? 0}</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/followers',
              params: { userId, tab: 'following', nickname: profile.nickname },
            })
          }
        >
          <Text variant="caption">팔로잉 {profile.followingCount ?? 0}</Text>
        </Pressable>
      </View>
    </ProfileHeader>
  );

  return (
    <ScreenShell title={profile.nickname ?? '프로필'} edges={['top', 'bottom']}>
      <FeedThumbnail
        posts={postsData?.pages.flatMap((p) => p.data) ?? []}
        hideNickname
        ListHeaderComponent={profileHeader}
        ListEmptyComponent={postsEmptyComponent}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        isLoadingMore={isFetchingNextPage}
        onRefresh={() => {
          refetchProfile();
          refetchPosts();
        }}
        refreshing={isRefetchingProfile || isRefetchingPosts}
      />
    </ScreenShell>
  );
}
