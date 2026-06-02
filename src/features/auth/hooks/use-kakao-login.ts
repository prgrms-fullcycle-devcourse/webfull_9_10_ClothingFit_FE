import { login } from '@react-native-kakao/user';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useState } from 'react';
import { Platform } from 'react-native';

import { setAuthToken } from '@/lib/api-client';
import { setTokens } from '@/lib/auth-storage';
import { KakaoLogin, type KakaoLoginData } from '../api/kakao';

// 카카오 네이티브 모듈이 없는 환경(웹/Expo Go)
const isKakaoUnavailable =
  Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<KakaoLoginData> => {
    if (isKakaoUnavailable) {
      throw new Error('카카오 로그인은 개발 빌드에서만 동작합니다. (Expo Go·웹 미지원)');
    }

    setIsLoading(true);
    try {
      const token = await login(); // 카카오 로그인 → 카카오 토큰
      const data = await KakaoLogin(token.accessToken); // 백엔드 → 앱 토큰
      await setTokens(data.accessToken, data.refreshToken);
      setAuthToken(data.accessToken);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}
