import { ExploreBrowserScreen } from '@/features/webview/screens/explore-browser-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function ExploreBrowserRoute() {
  // 포커스될 때마다 전역 스토어로 탭바를 숨긴다. 다른 화면(의상 최종 확인 등)이 언마운트되며
  // 탭바를 켜놓고 와도, COPY 화면으로 돌아오면 다시 숨겨진다.
  // (정적 tabBarStyle이 덮어써져 COPY에서 탭바가 살아나던 버그 방지)
  useHideTabBar();
  return <ExploreBrowserScreen />;
}
