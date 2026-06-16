import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { TAB_BAR_BASE_HEIGHT } from '@/constants/tab-bar';
import { useTabBarScroll } from '@/features/navigation/use-tab-bar-scroll';
import { Text } from '@/components/ui/text';
import { usePopularPosts, useRecommendedInfluencers } from '@/features/home/api';
import { HotUserCard } from '@/features/home/components/hot-user-card';
import { useUnreadNotificationCount } from '@/features/notifications/api';
import { PopularCarousel } from '@/features/home/components/popular-carousel-reanimated';
import { getUserId } from '@/lib/auth-storage';

// HOT 카드 배경 placeholder 색 (이미지 로딩 전/없을 때 자리)
const HOT_BG = ['#fca5a5', '#bfdbfe', '#99f6e4'];

/** 섹션의 로딩/에러/빈 상태 메시지를 가운데 정렬로 감싸는 래퍼. */
function StateMessage({ children }: { children: ReactNode }) {
  return <View className="items-center py-10">{children}</View>;
}

/** 쿼리 상태에 따라 로딩/에러/빈/콘텐츠를 한 곳에서 렌더링 */
function QuerySection<T>({
  query,
  children,
}: {
  query: UseQueryResult<T[], unknown>;
  children: (data: T[]) => ReactNode;
}) {
  if (query.isLoading) {
    return (
      <StateMessage>
        <ActivityIndicator />
      </StateMessage>
    );
  }
  if (query.isError) {
    return (
      <StateMessage>
        <Text variant="caption">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Text>
      </StateMessage>
    );
  }
  if (!query.data || query.data.length === 0) {
    return (
      <StateMessage>
        <Text variant="caption">표시할 항목이 없습니다.</Text>
      </StateMessage>
    );
  }
  return <>{children(query.data)}</>;
}

/** 메인(홈) 화면. 알림 뱃지 헤더 + 인기글 캐러셀 + HOT 인플루언서 목록을 렌더링한다. */
export function HomeScreen() {
  const posts = usePopularPosts();
  const influencers = useRecommendedInfluencers();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const insets = useSafeAreaInsets();
  const scrollHandler = useTabBarScroll();

  // 내 userId — HOT 카드에 내가 뜨면 팔로우 버튼을 숨기기 위해 한 번만 읽는다.
  const [myUserId, setMyUserId] = useState<string | null>(null);
  useEffect(() => {
    getUserId().then(setMyUserId);
  }, []);

  return (
    <ScreenShell noHeader>
      {/* 헤더 */}
      <View className="z-10 flex-row items-center justify-between bg-white px-4 py-3">
        <Text variant="title">CLOTHING - FIT</Text>
        <Pressable onPress={() => router.push('/(tabs)/home/notifications')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          {unreadCount > 0 && (
            <View className="absolute -right-1.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
              <Text
                className="text-[10px] font-sans-bold text-white"
                // 작은 뱃지 안에서 NotoSansKR 글리프가 아래로 잘리는 것 방지
                style={{ includeFontPadding: false, lineHeight: 12, textAlignVertical: 'center' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom }}
      >
        <QuerySection query={posts}>{(data) => <PopularCarousel posts={data} />}</QuerySection>

        {/* HOT */}
        <Text
          variant="subtitle"
          className="pl-7 pt-10 pb-3 text-[1.35rem] leading-tight font-sans-bold tracking-tighter"
        >
          요즘 인기 있는 스타일
        </Text>
        <QuerySection query={influencers}>
          {(data) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4 pb-8"
            >
              {data.map((user, i) => (
                <HotUserCard
                  key={i}
                  user={user}
                  bgColor={HOT_BG[i % HOT_BG.length]}
                  index={i}
                  myUserId={myUserId}
                />
              ))}
            </ScrollView>
          )}
        </QuerySection>
      </Animated.ScrollView>
    </ScreenShell>
  );
}
