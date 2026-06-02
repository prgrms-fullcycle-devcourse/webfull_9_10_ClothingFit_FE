import '../global.css';
// import '@expo/browser-polyfill';
import {
  NotoSans_100Thin,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { Platform, useColorScheme } from 'react-native';
import { initializeKakaoSDK } from '@react-native-kakao/core'; // 카카오 SDK 초기화
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { Splash } from '@/components/blocks/splash';
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
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSans_100Thin,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
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
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
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
