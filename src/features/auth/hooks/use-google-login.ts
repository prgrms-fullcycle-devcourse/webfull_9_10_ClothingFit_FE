import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useState } from 'react';

import { postAuthGoogle } from '@/api/generated/endpoints/auth/auth';
import type { KakaoLoginResponseData } from '@/api/generated/schemas';
import { setAuthToken } from '@/lib/api-client';
import { setTokens } from '@/lib/auth-storage';
import { isNativeSocialAvailable } from '../lib/native-social';

/**
 * 구글 로그인 훅.
 * 구글 idToken 획득 → 백엔드(/auth/google) 전송 → 앱 토큰 저장까지 수행하고,
 * 라우팅 분기에 쓸 로그인 데이터(isNewUser 포함)를 반환한다.
 * 사용자가 취소하면 null 반환.
 *
 * GoogleSignin.configure는 app/_layout.tsx에서 1회 수행한다.
 */
export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (): Promise<KakaoLoginResponseData | null> => {
    if (!isNativeSocialAvailable) {
      throw new Error('구글 로그인은 개발 빌드에서만 동작합니다. (Expo Go·웹 미지원)');
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        return null; // 사용자가 취소
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('구글 idToken을 받지 못했습니다. (webClientId 설정 확인)');
      }

      const { data } = await postAuthGoogle({ idToken });
      await setTokens(data.accessToken, data.refreshToken);
      setAuthToken(data.accessToken);

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}
