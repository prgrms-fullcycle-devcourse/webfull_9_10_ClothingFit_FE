import { makeMutable, withTiming } from 'react-native-reanimated';

/**
 * 하단 탭 바 숨김 정도 (전역 공유값).
 * 0 = 완전히 보임, 1 = 완전히 숨김(아래로 내려감).
 *
 * 스크롤 화면이 방향에 따라 이 값을 바꾸고, 커스텀 탭 바가 translateY로 반영한다.
 * 화면(컴포넌트) 밖에서도 쓰므로 makeMutable로 만든다.
 */
export const tabBarHidden = makeMutable(0);

const DURATION = 320;

export function showTabBar() {
  tabBarHidden.value = withTiming(0, { duration: DURATION });
}

export function hideTabBar() {
  tabBarHidden.value = withTiming(1, { duration: DURATION });
}
