import { useState } from 'react';
import {
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { PopularPost } from '@/features/home/api';
import { cn } from '@/utils/cn';

import { PopularPostCard } from './popular-post-card';

const PEEK = 16; // 좌우로 다음 글이 살짝 보이는 폭
const GAP = 0; // 카드 사이 간격 (0 = 슬라이드끼리 딱 붙게)

export function PopularCarousel({ posts }: { posts: PopularPost[] }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // 현재 카드 + 좌우 PEEK + GAP 이 한 화면에 들어오도록 카드 폭을 계산
  const cardWidth = width - 2 * GAP - 2 * PEEK;
  const interval = cardWidth + GAP;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / interval));
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: PEEK + GAP }}
        onMomentumScrollEnd={onScrollEnd}
      >
        {posts.map((post, i) => (
          <View key={i} style={{ width: cardWidth, marginRight: i === posts.length - 1 ? 0 : GAP }}>
            <PopularPostCard post={post} />
          </View>
        ))}
      </ScrollView>

      {/* 페이지 점 */}
      <View className="flex-row justify-center gap-2" style={{ marginTop: 22 }}>
        {posts.map((_, i) => (
          <View
            key={i}
            className={cn('h-2 w-2 rounded-full', i === index ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </View>
    </View>
  );
}
