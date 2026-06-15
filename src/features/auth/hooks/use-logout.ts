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

      // 서버 refresh token 무효화는 느려서(onrender 콜드 스타트) best-effort 백그라운드 실행.
      if (refreshToken) {
        deleteAuthLogout({ refreshToken }).catch(() => {});
      }

      // 소셜 SDK 세션은 반드시 정리되어야 다음 로그인에서 계정 전환/재인증이 정상 동작한다.
      // (fire-and-forget 시 구글 세션이 남아 다른 계정/카카오로 못 바꾸고 이전 계정으로 재로그인됨)
      // 단 SDK가 멈출 수 있어 타임아웃(3초)으로 캡해 로그아웃이 무한 대기하지 않게 한다.
      if (isNativeSocialAvailable) {
        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([Promise.allSettled([kakaoLogout(), GoogleSignin.signOut()]), timeout]);
      }

      // 로컬 세션 정리 → 사용자는 바로 로그아웃됨 (SecureStore 삭제는 빠름)
      // (React Query 캐시는 여기서 비우지 않는다 — 아직 마운트된 (tabs) 화면이 undefined로
      //  리렌더되며 크래시하기 때문. 캐시 제거는 다음 로그인 시점에 안전하게 수행한다.)
      await clearTokens();
      setAuthToken(null);
    } finally {
      setIsLoading(false);
      router.replace('/(auth)/login');
    }
  };

  return { logout, isLoading };
}
