import { NicknameScreen } from '@/features/profile/screens/nickname-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

export default function NicknameRoute() {
  useHideTabBar();
  return <NicknameScreen />;
}
