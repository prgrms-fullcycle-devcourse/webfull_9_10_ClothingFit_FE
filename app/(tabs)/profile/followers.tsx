import { FollowersScreen } from '@/features/profile/screens/followers-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function FollowersRoute() {
  useHideTabBar();
  return <FollowersScreen />;
}
