import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { personImageAt } from '@/features/home/constants/person-images';
import { cn } from '@/utils/cn';

type HotUser = { id: string; nickname: string; followers: number };

function formatFollowers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function HotUserCard({
  user,
  bgColor,
  defaultFollowing = false,
  index = 0,
}: {
  user: HotUser;
  bgColor: string;
  defaultFollowing?: boolean;
  index?: number;
}) {
  const [following, setFollowing] = useState(defaultFollowing);
  const personImage = personImageAt(index);

  return (
    <View
      className="w-40 overflow-hidden rounded-2xl border border-border bg-white"
      style={{ height: 210 }}
    >
      {/* 인물 이미지 (60%, 전체가 다 보이게 중앙 배치) + 가운데 겹치는 원형 아바타 */}
      <View style={{ flex: 6, backgroundColor: bgColor }}>
        <Image
          source={personImage}
          contentFit="contain"
          className="absolute inset-0 h-full w-full"
        />
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
            <Image source={personImage} contentFit="cover" className="h-full w-full" />
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
        <Pressable
          style={{ alignItems: 'center', gap: 2 }}
          onPress={() => router.push(`/(tabs)/profile/user/${user.id}`)}
        >
          <Text className="font-sans-bold" numberOfLines={1}>
            {user.nickname}
          </Text>
          <Text variant="caption">{formatFollowers(user.followers)} followers</Text>
        </Pressable>

        <Pressable
          onPress={() => setFollowing((v) => !v)}
          style={{
            alignSelf: 'stretch',
            alignItems: 'center',
            borderRadius: 999,
            paddingVertical: 6,
          }}
          className={cn(following ? 'bg-accent' : 'bg-primary')}
        >
          <Text className="text-xs font-sans-medium text-white">
            {following ? '팔로잉' : '팔로우'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
