import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useState } from 'react';

import { postAuthGoogle, type LoginData } from '@/features/auth/api';
import { setAuthToken } from '@/lib/api-client';
import { saveUserIdFromToken, setTokens } from '@/lib/auth-storage';
import { queryClient } from '@/lib/query-client';
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

  const signIn = async (): Promise<LoginData | null> => {
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

      // 백엔드는 토큰을 최상위로 반환(스펙의 { message, data } 래퍼와 다름 — 실제 배포 응답 기준)
      const data = (await postAuthGoogle({ idToken })) as unknown as LoginData;
      // 이전 계정 캐시 제거 — 로그인 화면에선 데이터 의존 화면이 없어 안전하다.
      // (계정 전환 시 옛 계정의 프로필·홈 캐시가 그대로 보이던 문제 방지)
      queryClient.clear();
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
