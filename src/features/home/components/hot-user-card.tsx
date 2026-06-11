import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useUserFollow } from '@/features/feed/hooks/use-user-follow';
import type { RecommendedInfluencer } from '@/features/home/api';
import { personImageAt } from '@/features/home/constants/person-images';
import { cn } from '@/utils/cn';

function formatFollowers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function HotUserCard({
  user,
  bgColor,
  index = 0,
}: {
  user: RecommendedInfluencer;
  bgColor: string;
  index?: number;
}) {
  // useUserFollow가 optimistic 상태를 반영하므로 isFollowing/toggle을 그대로 사용한다.
  const { isFollowing, toggle } = useUserFollow({
    userId: user.userId,
    isFollowing: user.isFollowing,
  });

  // API 이미지가 없으면 로컬 인물 이미지로 폴백
  const fallback = personImageAt(index);
  const postSource = user.postImage ?? fallback;
  const avatarSource = user.profileImage ?? fallback;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/(tabs)/home/user/[userId]', params: { userId: user.userId } })
      }
      className="w-40 overflow-hidden rounded-2xl border border-border bg-white"
      style={{ height: 220 }}
    >
      {/* 게시글 이미지 (60%) + 가운데 겹치는 원형 아바타 */}
      <View style={{ flex: 6, backgroundColor: bgColor }}>
        <Image source={postSource} contentFit="cover" className="absolute inset-0 h-full w-full" />
        <View
          style={{
            position: 'absolute',
            bottom: -14,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: '#ffffff',
              backgroundColor: '#f6f6f6',
              overflow: 'hidden',
            }}
          >
            <Image source={avatarSource} contentFit="cover" className="h-full w-full" />
          </View>
        </View>
      </View>

      {/* 텍스트 영역 (40%) */}
      <View
        style={{
          flex: 4,
          paddingHorizontal: 12,
          paddingTop: 16,
          paddingBottom: 6,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text
            className="font-sans-bold"
            numberOfLines={1}
            // NotoSansKR 세로 클리핑 방지(글자 잘림) + 작은 카드에 맞춰 축소
            style={{ fontSize: 13, lineHeight: 18, includeFontPadding: false }}
          >
            {user.nickname}
          </Text>
          <Text
            variant="caption"
            style={{ fontSize: 11, lineHeight: 15, includeFontPadding: false }}
          >
            {formatFollowers(user.followerCount)} followers
          </Text>
        </View>

        <Pressable
          onPress={toggle}
          style={{
            alignSelf: 'stretch',
            alignItems: 'center',
            borderRadius: 999,
            paddingVertical: 7,
          }}
          className={cn(isFollowing ? 'bg-accent' : 'bg-primary')}
        >
          <Text
            className="font-sans-medium text-white"
            // 작은 pill 안에서 한글이 안 잘리도록 lineHeight·padding 보정
            style={{ fontSize: 12, lineHeight: 16, includeFontPadding: false }}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
