import { UserProfileScreen } from '@/features/profile/screens/user-profile-screen';

/** 라우트: 홈 탭에서 연 타 사용자 프로필. 홈 스택에 push되어 뒤로가기 시 홈으로 돌아간다. */
export default function HomeUserProfileRoute() {
  return <UserProfileScreen />;
}
