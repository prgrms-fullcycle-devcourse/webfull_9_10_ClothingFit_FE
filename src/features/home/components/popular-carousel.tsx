import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
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
const AUTOPLAY_MS = 4000; // 자동 전환 간격(슬라이드가 멈춰 있는 시간)
const SLIDE_DURATION = 500; // 자동 전환 시 넘어가는 애니메이션 길이(클수록 느림)

/**
 * 인기글 캐러셀 — 무한 루프 + 자동 재생.
 * 앞뒤에 클론 슬라이드([마지막, ...실제, 처음])를 두고, 끝/처음 클론에 닿으면
 * 애니메이션 없이 대응하는 실제 슬라이드로 점프해 끊김 없이 순환한다.
 * 자동 전환은 프레임 단위로 직접 스크롤해 속도(SLIDE_DURATION)를 제어한다.
 * 사용자가 스크롤을 만지는 동안은 자동 재생을 멈춘다.
 */
export function PopularCarousel({ posts }: { posts: PopularPost[] }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 2 * GAP - 2 * PEEK;
  const interval = cardWidth + GAP;

  const n = posts.length;
  const loop = n > 1; // 슬라이드가 2개 이상일 때만 루프/자동재생

  // 무한 루프용 데이터: 실제 첫 슬라이드는 확장 인덱스 1에 위치한다.
  const data = loop ? [posts[n - 1], ...posts, posts[0]] : posts;

  const scrollRef = useRef<ScrollView>(null);
  const extRef = useRef(loop ? 1 : 0); // 현재 확장 인덱스(클론 포함)
  const pausedRef = useRef(false); // 사용자가 만지는 동안 자동재생 일시정지
  const animRef = useRef<number | null>(null); // 진행 중인 자동 전환 애니메이션 프레임 id
  const [dot, setDot] = useState(0); // 페이지 점용 실제 인덱스

  const jumpToExt = (ext: number) => {
    scrollRef.current?.scrollTo({ x: interval * ext, animated: false });
  };

  const cancelAnim = () => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  // fromX → toX 를 duration 동안 부드럽게(ease-in-out) 직접 스크롤. 끝나면 onDone 호출.
  const animateTo = (fromX: number, toX: number, duration: number, onDone?: () => void) => {
    cancelAnim();
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs == null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // easeInOutQuad
      scrollRef.current?.scrollTo({ x: fromX + (toX - fromX) * eased, animated: false });
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
        onDone?.();
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  // 마운트(및 폭 변경) 시 첫 실제 슬라이드(확장 1)로 위치시킨다.
  useEffect(() => {
    if (!loop) return;
    const raf = requestAnimationFrame(() => jumpToExt(1));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, interval]);

  // 사용자가 직접 스와이프해 클론에 닿으면, 멈춘 뒤 대응하는 실제 슬라이드로 점프
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    let ext = Math.round(e.nativeEvent.contentOffset.x / interval);
    if (loop) {
      if (ext <= 0) {
        ext = n;
        jumpToExt(ext);
      } else if (ext >= n + 1) {
        ext = 1;
        jumpToExt(ext);
      }
    }
    extRef.current = ext;
    setDot(loop ? (ext - 1 + n) % n : ext);
    pausedRef.current = false; // 손을 뗐고 스크롤이 멈췄으니 자동재생 재개
  };

  // 점을 누르면 해당 실제 인덱스로 부드럽게 이동. (루프 모드는 실제 i가 확장 i+1 위치)
  const goToDot = (target: number) => {
    if (target === dot) return;
    cancelAnim(); // 진행 중인 자동 전환 애니메이션 중단
    const fromX = interval * extRef.current;
    const targetExt = loop ? target + 1 : target;
    extRef.current = targetExt;
    setDot(target);
    pausedRef.current = true; // 이동하는 동안 자동재생 정지
    animateTo(fromX, interval * targetExt, SLIDE_DURATION, () => {
      pausedRef.current = false; // 도착 후 자동재생 재개
    });
  };

  // 자동 재생
  useEffect(() => {
    if (!loop) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const cur = extRef.current;
      const next = cur + 1;
      extRef.current = next;
      setDot((next - 1 + n) % n);
      animateTo(interval * cur, interval * next, SLIDE_DURATION, () => {
        // 처음 클론까지 넘어갔으면 애니메이션 직후 실제 처음으로 조용히 점프
        if (next >= n + 1) {
          extRef.current = 1;
          jumpToExt(1);
        }
      });
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(id);
      cancelAnim();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, interval, n]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        contentOffset={{ x: loop ? interval : 0, y: 0 }}
        contentContainerStyle={{ paddingHorizontal: PEEK + GAP }}
        onMomentumScrollEnd={onMomentumEnd}
        onScrollBeginDrag={() => {
          pausedRef.current = true;
          cancelAnim(); // 사용자가 잡으면 진행 중인 자동 전환 애니메이션 중단
        }}
      >
        {data.map((post, i) => (
          <View key={i} style={{ width: cardWidth, marginRight: i === data.length - 1 ? 0 : GAP }}>
            <PopularPostCard post={post} />
          </View>
        ))}
      </ScrollView>

      {/* 페이지 점 */}
      <View className="flex-row justify-center gap-2" style={{ marginTop: 22 }}>
        {posts.map((_, i) => (
          <Pressable key={i} onPress={() => goToDot(i)} hitSlop={8}>
            <View
              className={cn('h-2 w-2 rounded-full', i === dot ? 'bg-[#2563EB]' : 'bg-border')}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
