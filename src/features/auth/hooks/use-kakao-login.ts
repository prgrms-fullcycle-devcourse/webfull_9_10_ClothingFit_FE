import { login } from '@react-native-kakao/user';
import { useState } from 'react';

import { setAuthToken } from '@/lib/api-client';
import { setTokens } from '@/lib/auth-storage';
import { KakaoLogin, type KakaoLoginData } from '../api/kakao';
import { isNativeSocialAvailable } from '../lib/native-social';

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<KakaoLoginData> => {
    if (!isNativeSocialAvailable) {
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
