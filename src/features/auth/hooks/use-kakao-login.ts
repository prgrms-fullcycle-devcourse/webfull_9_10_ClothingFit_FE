import { login } from '@react-native-kakao/user';
import { useState } from 'react';

import { postAuthKakao, type LoginData } from '@/features/auth/api';
import { setAuthToken } from '@/lib/api-client';
import { saveUserIdFromToken, setLastProvider, setTokens } from '@/lib/auth-storage';
import { queryClient } from '@/lib/query-client';
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
      // 이전 계정 캐시 제거 — 로그인 화면에선 데이터 의존 화면이 없어 안전하다.
      // (계정 전환 시 옛 계정의 프로필·홈 캐시가 그대로 보이던 문제 방지)
      queryClient.clear();
      await setTokens(data.accessToken, data.refreshToken);
      await saveUserIdFromToken(data.accessToken);
      await setLastProvider('kakao'); // 다음 로그인 화면에 "마지막 로그인" 표시용
      setAuthToken(data.accessToken);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}
