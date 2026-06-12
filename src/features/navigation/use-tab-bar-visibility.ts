import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { setTabBarVisible } from './tab-bar-store';

/**
 * 화면에 focus될 때마다 하단 탭 바를 숨긴다 (상세·설정 등 하위 화면용).
 * blur 시 복원하지 않으므로(다음 화면이 알아서 정함) 화면을 옮겨다녀도 안 꼬인다.
 * 탭 루트로 돌아가면 그 루트가 useShowTabBar로 다시 켠다.
 */
export function useHideTabBar() {
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
    }, []),
  );
}

/** 화면에 focus될 때마다 하단 탭 바를 보이게 한다 (탭 루트용). */
export function useShowTabBar() {
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
    }, []),
  );
}
