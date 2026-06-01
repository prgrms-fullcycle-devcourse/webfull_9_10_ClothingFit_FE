import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { MOCK_WORN_PRODUCTS } from '@/mocks/data';
import { cn } from '@/utils/cn';

import { PopularPostCard } from './popular-post-card';

type Post = {
  id: string;
  nickname: string;
  createdAt: string;
  likes: number;
  imageColor: string;
};

export function PopularCarousel({ posts }: { posts: Post[] }) {
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
          <Pressable
            key={post.id}
            style={{ width }}
            className="px-4"
            onPress={() => router.push(`/(tabs)/feed/${post.id}`)}
          >
            <PopularPostCard post={post} products={MOCK_WORN_PRODUCTS} index={i} />
          </Pressable>
        ))}
      </ScrollView>

      {/* 페이지 점 */}
      <View className="flex-row justify-center gap-2" style={{ marginTop: 22 }}>
        {posts.map((post, i) => (
          <View
            key={post.id}
            className={cn('h-2 w-2 rounded-full', i === index ? 'bg-primary' : 'bg-border')}
          />
        ))}
      </View>
    </View>
  );
}
