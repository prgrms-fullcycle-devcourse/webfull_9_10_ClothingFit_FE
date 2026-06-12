import { NotificationsScreen } from '@/features/profile/screens/notifications-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function NotificationsRoute() {
  useHideTabBar();
  return <NotificationsScreen />;
}
