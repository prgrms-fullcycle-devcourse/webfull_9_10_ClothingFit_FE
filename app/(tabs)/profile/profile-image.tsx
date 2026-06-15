import { ProfileImageScreen } from '@/features/profile/screens/profile-image-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

/** 라우트: 프로필 이미지 변경 화면. */
export default function ProfileImageRoute() {
  useHideTabBar();
  return <ProfileImageScreen />;
}
