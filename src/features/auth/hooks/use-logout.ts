import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import { router } from 'expo-router';
import { useState } from 'react';

import { deleteAuthLogout } from '@/features/auth/api';
import { setAuthToken } from '@/lib/api-client';
import { clearTokens, getRefreshToken } from '@/lib/auth-storage';
import { isNativeSocialAvailable } from '../lib/native-social';

/**
 * 로그아웃 훅.
 * 서버 refresh token 무효화 → 앱 토큰 삭제 → 인증 헤더 제거 → 소셜 SDK 세션 정리 후
 * 로그인 화면으로 이동한다.
 * 서버/SDK 정리는 실패해도 로컬 로그아웃을 막지 않는다(best-effort).
 */
export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // refresh token은 로컬 삭제 전에 읽어둔다.
      const refreshToken = await getRefreshToken();

      // 서버 refresh token 무효화 + 소셜 SDK 정리는 모두 best-effort라 await하지 않는다.
      // (onrender 콜드 스타트/SDK 지연으로 로그아웃이 최대 30초 걸리던 문제 방지 → 백그라운드 실행)
      if (refreshToken) {
        deleteAuthLogout({ refreshToken }).catch(() => {});
      }
      if (isNativeSocialAvailable) {
        void Promise.allSettled([kakaoLogout(), GoogleSignin.signOut()]);
      }

      // 로컬 세션만 즉시 정리 → 사용자는 바로 로그아웃됨 (SecureStore 삭제는 빠름)
      await clearTokens();
      setAuthToken(null);
    } finally {
      setIsLoading(false);
      router.replace('/(auth)/login');
    }
  };

  return { logout, isLoading };
}
