import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

import { setTabBarVisible, showTabBar, tabBarHidden } from './tab-bar-store';

/** 방향 감지 임계값(px) — 미세한 떨림 무시 */
const THRESHOLD = 8;

/**
 * 스크롤 방향에 따라 하단 탭 바를 숨기고/보이게 하는 스크롤 핸들러.
 * 반환값을 reanimated `Animated.ScrollView`/`Animated.FlatList`의 `onScroll`에 연결한다.
 * - 아래로 스크롤(콘텐츠 위로 밀기) → 탭 바 숨김
 * - 위로 스크롤 / 최상단 → 탭 바 표시
 */
export function useTabBarScroll() {
  const lastY = useSharedValue(0);

  // 탭 루트로 focus될 때마다 탭 바를 다시 켜고 위치 초기화 (하위 화면에서 숨겨둔 상태 복원)
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
      showTabBar();
    }, []),
  );

  return useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      const dy = y - lastY.value;
      if (y <= 0) {
        tabBarHidden.value = withTiming(0, { duration: 320 });
      } else if (dy > THRESHOLD) {
        tabBarHidden.value = withTiming(1, { duration: 320 });
      } else if (dy < -THRESHOLD) {
        tabBarHidden.value = withTiming(0, { duration: 320 });
      }
      lastY.value = y;
    },
  });
}
