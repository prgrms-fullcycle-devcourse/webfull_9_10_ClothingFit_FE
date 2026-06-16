import { Redirect } from 'expo-router';

/**
 * 루트 "/" 진입점 — 곧장 홈으로 리다이렉트한다.
 * (app/index가 없으면 "/"가 매칭 안 돼 시작 시 +not-found가 잠깐 깜빡이는 문제 방지.
 *  미로그인이면 홈 → 인증 게이트(_layout)가 로그인으로 보낸다.)
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
