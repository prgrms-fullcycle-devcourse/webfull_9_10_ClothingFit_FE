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
      // 서버에 refresh token 무효화 요청 (로컬 삭제 전에 읽어야 함, best-effort)
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await deleteAuthLogout({ refreshToken }).catch(() => {}); // 네트워크 실패해도 로컬 로그아웃 진행
      }

      // 앱 세션 정리
      await clearTokens();
      setAuthToken(null);

      // 소셜 SDK 세션 정리 (best-effort: 이미 만료/미로그인 상태여도 무시)
      if (isNativeSocialAvailable) {
        await Promise.allSettled([kakaoLogout(), GoogleSignin.signOut()]);
      }
    } finally {
      setIsLoading(false);
      router.replace('/(auth)/login');
    }
  };

  return { logout, isLoading };
}
