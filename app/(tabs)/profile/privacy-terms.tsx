import { PrivacyTermsScreen } from '@/features/profile/screens/privacy-terms-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

/** 라우트: 개인정보 이용 약관 화면. */
export default function PrivacyTermsRoute() {
  useHideTabBar();
  return <PrivacyTermsScreen />;
}
