import type { EdgeInsets } from 'react-native-safe-area-context';

/**
 * 하단 탭 바 공통 스타일.
 * 아이콘+라벨이 안 잘리게 높이를 충분히 확보하고 하단 safe-area를 반영한다.
 *
 * 탭 바를 잠깐 숨겼다가(`{ display: 'none' }`) 복원하는 화면은
 * 반드시 `undefined`가 아니라 이 스타일로 되돌려야 한다.
 * (`undefined`로 되돌리면 커스텀 높이가 사라져 라벨이 잘리는 기본 탭 바가 된다.)
 */
export function getTabBarStyle(insets: Pick<EdgeInsets, 'bottom'>) {
  return {
    height: 66 + insets.bottom,
    paddingBottom: insets.bottom + 10,
    paddingTop: 8,
  };
}
