import { OpenLicensesScreen } from '@/features/profile/screens/open-licenses-screen';
import { useHideTabBar } from '@/features/navigation/use-tab-bar-visibility';

/** 라우트: 오픈 라이선스 화면. */
export default function OpenLicensesRoute() {
  useHideTabBar();
  return <OpenLicensesScreen />;
}
