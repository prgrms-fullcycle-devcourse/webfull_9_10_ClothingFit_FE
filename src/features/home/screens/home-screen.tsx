import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { HotUserCard } from '@/features/home/components/hot-user-card';
import { PopularCarousel } from '@/features/home/components/popular-carousel';
import { MOCK_POPULAR_USERS, MOCK_POSTS } from '@/mocks/data';

// HOT 카드 배경 placeholder 색 (인물 이미지 자리)
const HOT_BG = ['#fca5a5', '#bfdbfe', '#99f6e4'];

export function HomeScreen() {
  return (
    <ScreenShell noHeader>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Text variant="title">CLOTHING-FIT</Text>
        <Pressable onPress={() => router.push('/(tabs)/profile/notifications')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <Text className="text-[10px] font-sans-bold text-white">1</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 인기글 */}
        <Text variant="subtitle" className="px-4 pb-2 pt-4">
          인기글
        </Text>
        <PopularCarousel posts={MOCK_POSTS.slice(0, 5)} />

        {/* HOT */}
        <Text variant="subtitle" className="px-4 pb-2 pt-6">
          HOT
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-4 pb-8"
        >
          {MOCK_POPULAR_USERS.map((user, i) => (
            <HotUserCard
              key={user.id}
              user={user}
              bgColor={HOT_BG[i % HOT_BG.length]}
              defaultFollowing={i === 1}
              index={i}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </ScreenShell>
  );
}
