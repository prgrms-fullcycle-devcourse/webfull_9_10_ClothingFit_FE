import { UserProfileScreen } from '@/features/profile/screens/user-profile-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function UserProfileRoute() {
  useHideTabBar();
  return <UserProfileScreen />;
}
