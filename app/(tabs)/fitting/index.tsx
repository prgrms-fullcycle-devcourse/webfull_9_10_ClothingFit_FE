import { Redirect } from 'expo-router';

/**
 * 피팅 탭의 기본 진입점.
 * 과거엔 개발용 메뉴 화면(FittingHomeScreen)을 띄웠으나, 실제 시작점은 홈이므로
 * 이 경로로 들어오면 홈으로 리다이렉트한다.
 * (하단 AI피팅 버튼은 _layout에서 별도로 explore(쇼핑몰 COPY)로 보냄)
 */
export default function FittingIndexRoute() {
  return <Redirect href="/(tabs)/home" />;
}
