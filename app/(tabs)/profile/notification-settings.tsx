import { NotificationSettingsScreen } from '@/features/profile/screens/notification-settings-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

/** 라우트: 알림 설정 화면. */
export default function NotificationSettingsRoute() {
  useHideTabBar();
  return <NotificationSettingsScreen />;
}
