import '../global.css';
// import '@expo/browser-polyfill';
import {
  NotoSansKR_100Thin,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { Platform, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeKakaoSDK } from '@react-native-kakao/core'; // 카카오 SDK 초기화
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // 구글 SDK 설정
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { AppBanner } from '@/components/blocks/app-banner';
import { Splash } from '@/components/blocks/splash';
import { GOOGLE_WEB_CLIENT_ID } from '@/features/auth/constants/google';
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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansKR_100Thin,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });
  // 폰트 로드 후 커스텀 스플래시('CLOTHING - FIT')를 잠깐 보여준다.
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => setSplashDone(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!splashDone) {
    return <Splash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <View style={{ flex: 1 }}>
          <RootLayoutNav />
          <AppBanner />
        </View>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
