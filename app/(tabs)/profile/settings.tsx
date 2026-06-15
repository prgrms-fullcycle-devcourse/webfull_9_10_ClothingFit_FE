import { ProfileSettingsScreen } from '@/features/profile/screens/profile-settings-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function ProfileSettingsRoute() {
  useHideTabBar();
  return <ProfileSettingsScreen />;
}
