import { useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel';

import type { PopularPost } from '@/features/home/api';
import { cn } from '@/utils/cn';

import { ITEM_STRIP_COUNT, ITEM_STRIP_RATIO, PopularPostCard } from './popular-post-card';

const AUTOPLAY_MS = 4000; // 자동 전환 간격
const PEEK = 40; // 슬롯이 화면보다 좁은 만큼 양옆에서 다음 카드가 보인다(작을수록 active가 더 풀폭).
const SHADOW_PAD = 14; // 카드 그림자가 잘리지 않도록 슬롯 상하에 두는 여유(카드는 그 안에서 가운데 정렬).

/**
 * 슬롯 안에서 카드 크기를 애니메이션한다. parallax의 scale 대신 실제 width/height를 보간한다.
 * - 가운데(value 0): ACTIVE 크기(슬롯 꽉)
 * - 양옆(value ±1): SIDE 크기(작게) — 슬롯 안에서 가운데 정렬되어 양옆에 살짝 노출된다.
 */
function CarouselCard({
  post,
  animationValue,
  activeW,
  activeH,
  sideW,
  sideH,
}: {
  post: PopularPost;
  animationValue: SharedValue<number>;
  activeW: number;
  activeH: number;
  sideW: number;
  sideH: number;
}) {
  const animStyle = useAnimatedStyle(() => ({
    width: interpolate(
      animationValue.value,
      [-1, 0, 1],
      [sideW, activeW, sideW],
      Extrapolation.CLAMP,
    ),
    height: interpolate(
      animationValue.value,
      [-1, 0, 1],
      [sideH, activeH, sideH],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    // 기본 모드는 active를 슬롯 시작(왼쪽)에 두므로, 필름스트립을 PEEK만큼 오른쪽으로 밀어 가운데 정렬한다.
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateX: PEEK }],
      }}
    >
      <Animated.View style={animStyle}>
        <PopularPostCard post={post} />
      </Animated.View>
    </View>
  );
}

/**
 * 인기글 캐러셀 — react-native-reanimated-carousel 기반.
 * 무한 루프/자동재생/peek(양옆 살짝 보이기)를 라이브러리 prop으로 처리한다.
 *
 * 카드 높이는 오른쪽 옷 스트립(정사각 썸네일 5개)에 맞춰 고정 계산한다.
 * 썸네일 한 변 = 스트립 폭 = itemWidth × 비율, 그 5개가 카드 높이.
 */
export function PopularCarousel({ posts }: { posts: PopularPost[] }) {
  const { width } = useWindowDimensions();
  const itemWidth = width - 2 * PEEK; // 슬롯 폭(< 화면). 기본 모드가 이 슬롯을 화면 가운데에 두고 양옆에 다음 카드를 peek 시킨다.
  const loop = posts.length > 1; // 2개 이상일 때만 루프/자동재생

  // 정사각 썸네일 5개 높이 = active 카드 높이 (썸네일 한 변 = 스트립 폭 = itemWidth × 비율)
  const cardHeight = itemWidth * ITEM_STRIP_RATIO * ITEM_STRIP_COUNT;
  // 슬롯(=캐러셀) 높이는 카드보다 상하 SHADOW_PAD만큼 크게 — 그림자가 경계에서 잘리지 않도록.
  const slotHeight = cardHeight + 2 * SHADOW_PAD;

  // ── active(가운데) / 양옆 카드 크기 — scale이 아니라 실제 width·height(px) ──
  // 양옆 카드만 줄이고 싶으면 SIDE_W / SIDE_H 숫자만 바꾸면 된다.
  // 단, 카드 높이는 폭(정사각 5개)에 묶여 있어 W·H를 같은 비율로 줄여야 옷 스트립이 깔끔하게 맞는다.
  const ACTIVE_W = itemWidth; // 가운데 카드 너비(슬롯 꽉)
  const ACTIVE_H = cardHeight; // 가운데 카드 높이
  const SIDE_W = itemWidth * 0.92; // 양옆 카드 너비
  const SIDE_H = cardHeight * 0.92; // 양옆 카드 높이

  const ref = useRef<ICarouselInstance>(null);
  const [index, setIndex] = useState(0);

  return (
    <View>
      <Carousel
        ref={ref}
        data={posts}
        width={itemWidth}
        height={slotHeight}
        style={{ width }} // 컨테이너는 화면 전체 폭 → 좌우로 다음 카드가 peek 됨
        loop={loop}
        autoPlay={loop}
        autoPlayInterval={AUTOPLAY_MS}
        snapEnabled
        pagingEnabled
        onSnapToItem={setIndex}
        renderItem={({ item, animationValue }) => (
          <CarouselCard
            post={item}
            animationValue={animationValue}
            activeW={ACTIVE_W}
            activeH={ACTIVE_H}
            sideW={SIDE_W}
            sideH={SIDE_H}
          />
        )}
      />

      {/* 페이지 점 */}
      <View className="flex-row justify-center gap-2 mt-4">
        {posts.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => ref.current?.scrollTo({ index: i, animated: true })}
            hitSlop={8}
          >
            <View
              className={cn('h-2 w-2 rounded-full', i === index ? 'bg-[#373737]' : 'bg-border')}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
