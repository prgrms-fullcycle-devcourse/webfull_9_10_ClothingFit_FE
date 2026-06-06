import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { usePopularPosts, useRecommendedInfluencers } from '@/features/home/api';
import { HotUserCard } from '@/features/home/components/hot-user-card';
import { PopularCarousel } from '@/features/home/components/popular-carousel';
import { useBodyInfo, type BodyInfo } from '@/features/profile/api';

// HOT 카드 배경 placeholder 색 (이미지 로딩 전/없을 때 자리)
const HOT_BG = ['#fca5a5', '#bfdbfe', '#99f6e4'];

// 체형 정보 출력 항목 (백엔드는 라벨/단위를 주지 않음)
const BODY_INFO_FIELDS: { key: keyof BodyInfo; label: string; unit: string }[] = [
  { key: 'height', label: '키', unit: 'cm' },
  { key: 'weight', label: '몸무게', unit: 'kg' },
  { key: 'chest', label: '가슴 둘레', unit: 'cm' },
  { key: 'waist', label: '허리 둘레', unit: 'cm' },
  { key: 'hip', label: '엉덩이 둘레', unit: 'cm' },
  { key: 'shoulder', label: '어깨 둘레', unit: 'cm' },
  { key: 'head', label: '머리 둘레', unit: 'cm' },
  { key: 'footSize', label: '발 크기', unit: 'mm' },
];

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

/** 메인 진입 시 GET /profile/body 결과를 카드로 출력 */
function BodyInfoSection({ query }: { query: UseQueryResult<BodyInfo, unknown> }) {
  if (query.isLoading) {
    return (
      <StateMessage>
        <ActivityIndicator />
      </StateMessage>
    );
  }
  if (query.isError || !query.data) {
    return (
      <StateMessage>
        <Text variant="caption">체형 정보를 불러오지 못했습니다.</Text>
      </StateMessage>
    );
  }
  const info = query.data;
  return (
    <View className="mx-4 mt-2 gap-2 rounded-2xl border border-border p-4">
      {BODY_INFO_FIELDS.map((f) => (
        <View key={f.key} className="flex-row justify-between">
          <Text variant="caption">{f.label}</Text>
          <Text variant="label">{info[f.key] != null ? `${info[f.key]} ${f.unit}` : '-'}</Text>
        </View>
      ))}
    </View>
  );
}

export function HomeScreen() {
  const bodyInfo = useBodyInfo();
  const posts = usePopularPosts();
  const influencers = useRecommendedInfluencers();

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
        {/* 내 체형 정보 */}
        <Text variant="subtitle" className="px-4 pb-2 pt-4">
          내 체형 정보
        </Text>
        <BodyInfoSection query={bodyInfo} />

        {/* 인기글 */}
        <Text variant="subtitle" className="px-4 pb-2 pt-6">
          인기글
        </Text>
        <QuerySection query={posts}>{(data) => <PopularCarousel posts={data} />}</QuerySection>

        {/* HOT */}
        <Text variant="subtitle" className="px-4 pb-2 pt-6">
          HOT
        </Text>
        <QuerySection query={influencers}>
          {(data) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-4 pb-8"
            >
              {data.map((user, i) => (
                <HotUserCard key={i} user={user} bgColor={HOT_BG[i % HOT_BG.length]} index={i} />
              ))}
            </ScrollView>
          )}
        </QuerySection>
      </ScrollView>
    </ScreenShell>
  );
}
