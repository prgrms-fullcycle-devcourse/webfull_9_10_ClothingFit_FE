import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, View } from 'react-native';

import {
  useGetUsersIdFollowers,
  useGetUsersIdFollowings,
} from '@/api/generated/endpoints/follows/follows';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { TabButton } from '@/components/ui/tab-button';
import { Text } from '@/components/ui/text';
import { FollowButton } from '@/features/feed/components/follow-button';
import { useUserFollow } from '@/features/feed/hooks/use-user-follow';
import { getUserId } from '@/lib/auth-storage';

type FollowItem = {
  id: string;
  imageUrl: string | null;
  nickname: string;
  isFollowing: boolean;
};

type Tab = 'followers' | 'following';

/** 팔로워/팔로잉 목록의 한 행. 프로필 이동 + (내가 아니면) 팔로우 토글 버튼을 렌더한다. */
function FollowListItem({
  item,
  myUserId,
}: {
  item: FollowItem;
  myUserId: string | null | undefined;
}) {
  const { isFollowing, toggle } = useUserFollow({ userId: item.id, isFollowing: item.isFollowing });
  const isMe = !!myUserId && myUserId === item.id;

  return (
    <View className="flex-row items-center mb-4">
      <Pressable
        className="flex-row items-center flex-1"
        onPress={() => router.push({ pathname: '/user/[userId]', params: { userId: item.id } })}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
          />
        ) : (
          <View className="w-[48px] h-[48px] rounded-full bg-surface mr-3" />
        )}
        <Text className="font-sans-medium">{item.nickname}</Text>
      </Pressable>
      {myUserId !== undefined && !isMe && (
        <FollowButton isFollowing={isFollowing} onPress={toggle} />
      )}
    </View>
  );
}

/** 팔로워/팔로잉 사용자 목록(FlatList). */
function FollowList({
  items,
  myUserId,
  onRefresh,
  refreshing,
}: {
  items: FollowItem[];
  myUserId: string | null | undefined;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <FollowListItem item={item} myUserId={myUserId} />}
    />
  );
}

/** 팔로워·팔로잉 화면. userId 없이 진입하면(설정) 내 팔로워/팔로잉을 탭으로 보여준다. */
export function FollowersScreen() {
  const {
    userId,
    tab: initialTab,
    nickname,
  } = useLocalSearchParams<{ userId?: string; tab?: Tab; nickname?: string }>();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'followers');
  const [myUserId, setMyUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getUserId().then(setMyUserId);
  }, []);

  const targetId = userId ?? myUserId ?? undefined;

  const {
    data: followersData,
    isLoading: followersLoading,
    refetch: refetchFollowers,
    isRefetching: isRefetchingFollowers,
  } = useGetUsersIdFollowers(targetId ?? '', undefined, {
    query: { enabled: !!targetId },
  });
  const {
    data: followingsData,
    isLoading: followingsLoading,
    refetch: refetchFollowings,
    isRefetching: isRefetchingFollowings,
  } = useGetUsersIdFollowings(targetId ?? '', undefined, {
    query: { enabled: !!targetId },
  });

  const resolvingMe = !userId && myUserId === undefined;
  const isLoading = resolvingMe || (tab === 'followers' ? followersLoading : followingsLoading);
  const followerItems = followersData?.data ?? [];
  const followingItems = followingsData?.data ?? [];

  return (
    <ScreenShell title={nickname ? nickname : ''} edges={['top', 'bottom']}>
      <View className="flex-row pb-2">
        <TabButton
          label={`팔로워 ${followersData?.totalCount ?? 0}명`}
          selected={tab === 'followers'}
          onPress={() => setTab('followers')}
          className="flex-1 py-3"
        />
        <TabButton
          label={`팔로잉 ${followingsData?.totalCount ?? 0}명`}
          selected={tab === 'following'}
          onPress={() => setTab('following')}
          className="flex-1 py-3"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : tab === 'followers' ? (
        followerItems.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text variant="caption">회원님을 팔로우 하는 모든 사용자가 여기에 표시됩니다.</Text>
          </View>
        ) : (
          <FollowList
            items={followerItems}
            myUserId={myUserId}
            onRefresh={refetchFollowers}
            refreshing={isRefetchingFollowers}
          />
        )
      ) : followingItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text variant="caption">마음에 드는 회원님을 팔로우 해보세요.</Text>
        </View>
      ) : (
        <FollowList
          items={followingItems}
          myUserId={myUserId}
          onRefresh={refetchFollowings}
          refreshing={isRefetchingFollowings}
        />
      )}
    </ScreenShell>
  );
}
