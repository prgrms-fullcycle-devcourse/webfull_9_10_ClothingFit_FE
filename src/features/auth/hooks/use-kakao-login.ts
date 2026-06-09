import { login } from '@react-native-kakao/user';
import { useState } from 'react';

import { postAuthKakao, type LoginData } from '@/features/auth/api';
import { setAuthToken } from '@/lib/api-client';
import { saveUserIdFromToken, setTokens } from '@/lib/auth-storage';
import { isNativeSocialAvailable } from '../lib/native-social';

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<LoginData> => {
    if (!isNativeSocialAvailable) {
      throw new Error('카카오 로그인은 개발 빌드에서만 동작합니다. (Expo Go·웹 미지원)');
    }

    setIsLoading(true);
    try {
      const token = await login(); // 카카오 로그인 → 카카오 토큰
      // 백엔드는 토큰을 최상위로 반환(스펙의 { message, data } 래퍼와 다름 — 실제 배포 응답 기준)
      const data = (await postAuthKakao({
        accessToken: token.accessToken,
      })) as unknown as LoginData;
      await setTokens(data.accessToken, data.refreshToken);
      await saveUserIdFromToken(data.accessToken);
      setAuthToken(data.accessToken);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}
