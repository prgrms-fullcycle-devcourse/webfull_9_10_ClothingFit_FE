import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useGetUsersId, useGetUsersIdPosts } from '@/api/generated/endpoints/users/users';
import { ScreenShell } from '@/components/blocks/screen-shell';
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
  } = useGetUsersId(userId, {
    query: { enabled: !!userId },
  });
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
  } = useGetUsersIdPosts(userId, undefined, {
    query: { enabled: !!userId },
  });
  const { isFollowing, toggle } = useUserFollow({
    userId,
    isFollowing: profile?.isFollowing ?? false,
  });

  if (profileLoading) {
    return (
      <ScreenShell title="프로필">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenShell>
    );
  }

  if (profileError || !profile) {
    return (
      <ScreenShell title="프로필">
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
    <View className="py-12 items-center">
      <Text variant="caption">게시물을 불러오지 못했습니다.</Text>
    </View>
  ) : (
    <View className="py-12 items-center">
      <Text variant="caption">작성된 글이 없습니다.</Text>
    </View>
  );

  const profileHeader = (
    <ProfileHeader
      nickname={profile.nickname ?? ''}
      imageUrl={profile.imageUrl}
      action={
        myUserId !== undefined && !isMe ? (
          <FollowButton isFollowing={isFollowing} onPress={toggle} />
        ) : undefined
      }
    >
      <View className="flex-row gap-4 mt-1">
        <Text variant="caption">게시물 {profile.postCount ?? 0}</Text>
        <Pressable
          onPress={() => router.push(`/(tabs)/profile/followers?userId=${userId}&tab=followers`)}
        >
          <Text variant="caption">팔로워 {profile.followerCount ?? 0}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/(tabs)/profile/followers?userId=${userId}&tab=following`)}
        >
          <Text variant="caption">팔로잉 {profile.followingCount ?? 0}</Text>
        </Pressable>
      </View>
    </ProfileHeader>
  );

  return (
    <ScreenShell title={profile.nickname ?? '프로필'}>
      <FeedThumbnail
        posts={posts?.data ?? []}
        ListHeaderComponent={profileHeader}
        ListEmptyComponent={postsEmptyComponent}
      />
    </ScreenShell>
  );
}
