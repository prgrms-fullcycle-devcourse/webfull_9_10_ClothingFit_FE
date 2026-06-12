import { ProfileBodyScreen } from '@/features/profile/screens/profile-body-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function ProfileBodyRoute() {
  useHideTabBar();
  return <ProfileBodyScreen />;
}
