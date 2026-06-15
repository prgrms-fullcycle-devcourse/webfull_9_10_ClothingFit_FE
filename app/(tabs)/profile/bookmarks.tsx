import { BookmarksScreen } from '@/features/profile/screens/bookmarks-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function BookmarksRoute() {
  useHideTabBar();
  return <BookmarksScreen />;
}
