import '../global.css';
// import '@expo/browser-polyfill';
import { Inter_700Bold } from '@expo-google-fonts/inter';
import {
  NotoSansKR_100Thin,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_800ExtraBold,
  NotoSansKR_900Black,
} from '@expo-google-fonts/noto-sans-kr';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useSyncExternalStore } from 'react';
import 'react-native-reanimated';

import { Platform, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeKakaoSDK } from '@react-native-kakao/core'; // 카카오 SDK 초기화
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // 구글 SDK 설정
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { AppBanner } from '@/components/blocks/app-banner';
import { Splash } from '@/components/blocks/splash';
import { GOOGLE_WEB_CLIENT_ID } from '@/features/auth/constants/google';
import { getIsAuthenticated, setAuthToken, subscribeAuthChange } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth-storage';
import { AppProviders } from '@/providers/app-providers';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// 카카오 네이티브 모듈은 웹/Expo Go에 없어 크래시하므로, 네이티브 dev/standalone 빌드에서만 초기화한다.
// (해당 환경에서는 카카오 로그인이 동작하지 않지만 나머지 화면은 정상 동작)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
if (Platform.OS !== 'web' && !isExpoGo) {
  // .catch로 네이티브 모듈 부재 시 비동기 거부(UnhandledPromiseRejection)도 방어
  initializeKakaoSDK('cd5580996c386e91f2565dbad3bc2854').catch(() => {}); // TODO: 키를 env/상수로
  try {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  } catch {
    // 네이티브 모듈(RNGoogleSignin) 미포함 빌드에서 앱 전체 크래시 방지 — 새 빌드 필요
  }
}

/**
 * 앱 루트 레이아웃. 폰트·소셜 SDK 초기화, 스플래시 표시, SecureStore 토큰 복원으로
 * 인증 상태를 부트스트랩한 뒤 RootLayoutNav(인증 게이트)를 렌더링한다.
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR_100Thin,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    NotoSansKR_800ExtraBold,
    NotoSansKR_900Black,
    Inter_700Bold,
  });
  // 폰트 로드 후 커스텀 스플래시('CLOTHING - FIT')를 잠깐 보여준다.
  const [splashDone, setSplashDone] = useState(false);
  // 시작 시 SecureStore의 access token을 axios 헤더로 복원하고 로그인 여부를 판단한다.
  const [authChecked, setAuthChecked] = useState(false);
  // 인증 여부는 setAuthToken(로그인/로그아웃) 변화를 구독해 실시간 반영한다.
  // (one-time state로 두면 로그아웃 후에도 stale하게 남아 메인으로 되돌아가는 문제 발생)
  const authed = useSyncExternalStore(subscribeAuthChange, getIsAuthenticated, getIsAuthenticated);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        setAuthToken(token); // 재시작 후에도 로그인 유지(axios 헤더 복원) + 인증 상태 동기화
      } catch {
        // SecureStore 미지원(웹) 등 → 미로그인으로 처리(로그인 화면으로 이동)
        setAuthToken(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded && authChecked) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => setSplashDone(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loaded, authChecked]);

  if (!loaded || !authChecked) {
    return null;
  }

  if (!splashDone) {
    return <Splash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <View style={{ flex: 1 }}>
          <RootLayoutNav authed={authed} />
          <AppBanner />
        </View>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

/**
 * 인증 게이트. 로그인 여부(authed)와 현재 경로(segments)에 따라
 * 미로그인이면 로그인 화면, 로그인됨인데 탭 밖이면 메인으로 리다이렉트한다.
 */
function RootLayoutNav({ authed }: { authed: boolean }) {
  const colorScheme = useColorScheme();
  // 네비게이터가 마운트된 뒤에만 이동해야 "navigate before mounting"으로 빈 화면이 뜨지 않는다.
  // (expo-router 공식 인증 패턴) navState.key가 생기면 준비 완료.
  const segments = useSegments();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return; // 네비게이션 준비 전
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSharedScreen = ['post', 'user', 'followers'].includes(segments[0] ?? '');
    if (!authed && !inAuthGroup) {
      router.replace('/(auth)/login'); // 미로그인 → 로그인 화면
    } else if (authed && !inTabsGroup && !inSharedScreen && !inAuthGroup) {
      // 로그인됨인데 탭·공유화면·인증 그룹 어디에도 없으면(잘못된 경로/+not-found 등) → 메인으로.
      // (auth) 그룹은 제외: 로그인됨 직후 신규 유저를 체형 등록(register)으로 보내는 흐름과
      // 레이스로 충돌해 메인으로 튕기던 문제 방지. 로그인/회원가입 화면은 자체 라우팅을 한다.
      router.replace('/(tabs)/home');
    }
  }, [authed, segments, navState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
        <Stack.Screen name="user/[userId]" options={{ headerShown: false }} />
        <Stack.Screen name="followers" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
