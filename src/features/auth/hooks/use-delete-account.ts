import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-kakao/user';
import { router } from 'expo-router';
import { useState } from 'react';

import { apiClient, setAuthToken } from '@/lib/api-client';
import { clearTokens } from '@/lib/auth-storage';
import { isNativeSocialAvailable } from '../lib/native-social';

/**
 * 계정 탈퇴 훅.
 * DELETE /users/me 로 서버 계정을 삭제한 뒤, 로그아웃과 동일하게 로컬 세션·소셜 SDK를 정리하고
 * 로그인 화면으로 이동한다.
 * 서버 삭제가 실패하면 세션을 유지한 채 에러를 그대로 던진다(호출부에서 안내).
 */
export function useDeleteAccount() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 탈퇴(204). 실패 시 catch에서 그대로 전파 → 세션 유지.
      await apiClient<void>({ url: '/users/me', method: 'DELETE' });
    } catch (e) {
      setIsLoading(false);
      throw e;
    }

    // 탈퇴 성공 → 로컬 세션 정리 후 이동 (로그아웃과 동일, 서버 logout 호출은 불필요)
    await clearTokens();
    setAuthToken(null);
    if (isNativeSocialAvailable) {
      void Promise.allSettled([kakaoLogout(), GoogleSignin.signOut()]);
    }
    setIsLoading(false);
    router.replace('/(auth)/login');
  };

  return { deleteAccount, isLoading };
}
