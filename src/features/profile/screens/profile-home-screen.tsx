import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_CLOSET_ITEMS, MOCK_POSTS, MOCK_USER } from '@/mocks/data';

const links = [
  { label: '체형 정보', href: '/(tabs)/profile/body' },
  { label: '설정', href: '/(tabs)/profile/settings' },
  { label: '알림', href: '/(tabs)/profile/notifications' },
  { label: '팔로워/팔로잉', href: '/(tabs)/profile/followers' },
  { label: '북마크한 코디', href: '/(tabs)/profile/bookmarks' },
  { label: '피팅 기록', href: '/(tabs)/profile/fitting-history' },
  { label: '닉네임 변경', href: '/(tabs)/profile/nickname' },
] as const;

export function ProfileHomeScreen() {
  return (
    <ScreenShell title="마이페이지" showBack={false} noHeader>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text variant="subtitle">마이페이지</Text>
        <View className="flex-row gap-3">
          <Pressable onPress={() => router.push('/(tabs)/profile/notifications')}>
            <Ionicons name="notifications-outline" size={22} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile/settings')}>
            <Ionicons name="settings-outline" size={22} />
          </Pressable>
        </View>
      </View>
      <ScrollView className="flex-1">
        <View className="px-4 py-4 flex-row gap-4">
          <View className="w-16 h-16 rounded-full bg-surface" />
          <View className="flex-1">
            <Pressable onPress={() => router.push('/(tabs)/profile/nickname')}>
              <Text variant="subtitle">{MOCK_USER.nickname} ✓</Text>
            </Pressable>
            <Text variant="caption">
              {MOCK_USER.height}cm / {MOCK_USER.weight}kg / {MOCK_USER.gender}
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/profile/followers')}>
              <Text variant="caption" className="mt-1">
                {MOCK_USER.followers} 팔로워 · {MOCK_USER.following} 팔로잉
              </Text>
            </Pressable>
          </View>
        </View>

        <Text variant="subtitle" className="px-4 mb-2">
          최근 본 커뮤니티
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
          {MOCK_POSTS.slice(0, 5).map((p) => (
            <View
              key={p.id}
              className="w-20 h-20 rounded-lg mr-2"
              style={{ backgroundColor: p.imageColor }}
            />
          ))}
        </ScrollView>

        <Text variant="subtitle" className="px-4 mb-2">
          내 옷장
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
          {MOCK_CLOSET_ITEMS.map((c) => (
            <Pressable
              key={c.id}
              className="w-24 h-32 rounded-xl mr-2 bg-surface"
              onPress={() => router.push(`/(tabs)/closet/${c.id}`)}
            />
          ))}
        </ScrollView>

        <View className="px-4 pb-8">
          {links.map((l) => (
            <Pressable
              key={l.href}
              className="py-3 border-b border-border flex-row justify-between"
              onPress={() => router.push(l.href)}
            >
              <Text>{l.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
