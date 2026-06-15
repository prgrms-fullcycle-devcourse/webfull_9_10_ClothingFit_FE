import { useSyncExternalStore } from 'react';
import { makeMutable, withTiming } from 'react-native-reanimated';

/**
 * 하단 탭 바 숨김 정도 (전역 공유값) — 스크롤 시 슬라이드용.
 * 0 = 완전히 보임, 1 = 완전히 숨김(아래로 내려감).
 */
export const tabBarHidden = makeMutable(0);

const DURATION = 320;

export function showTabBar() {
  tabBarHidden.value = withTiming(0, { duration: DURATION });
}

export function hideTabBar() {
  tabBarHidden.value = withTiming(1, { duration: DURATION });
}

// ── 탭 바 표시 여부 (상세/설정 등 하위 화면에서 완전히 숨김) ──────────────
// 화면이 focus될 때 명시적으로 true/false를 설정한다(useShowTabBar/useHideTabBar).
// reanimated가 아니라 React 구독 방식 — 커스텀 탭 바가 이 값으로 렌더 여부를 정한다.

let visible = true;
const visListeners = new Set<() => void>();

export function getTabBarVisible() {
  return visible;
}

export function setTabBarVisible(v: boolean) {
  if (visible === v) return;
  visible = v;
  visListeners.forEach((l) => l());
}

function subscribeTabBarVisible(l: () => void) {
  visListeners.add(l);
  return () => visListeners.delete(l);
}

/** 커스텀 탭 바가 구독해서 렌더 여부 결정 */
export function useTabBarVisible() {
  return useSyncExternalStore(subscribeTabBarVisible, getTabBarVisible, getTabBarVisible);
}
