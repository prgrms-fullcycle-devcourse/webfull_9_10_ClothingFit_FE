import { FittingHistoryScreen } from '@/features/profile/screens/fitting-history-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function ProfileFittingHistoryRoute() {
  useHideTabBar();
  return <FittingHistoryScreen />;
}
