import { useState } from 'react';
import {
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { GetHomePopularPosts200Item as PopularPost } from '@/api/generated/schemas';
import { cn } from '@/utils/cn';

import { PopularPostCard } from './popular-post-card';

export function PopularCarousel({ posts }: { posts: PopularPost[] }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {posts.map((post, i) => (
          <View key={i} style={{ width }} className="px-4">
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
