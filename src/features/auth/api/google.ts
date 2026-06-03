import { apiClient } from '@/lib/api-client';

/** POST /auth/google 응답의 data 필드 */
export type GoogleLoginData = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

type GoogleLoginResponse = {
  message: string;
  data: GoogleLoginData;
};

/**
 * 구글 idToken을 백엔드에 전달해 우리 앱의 토큰을 발급받는다.
 * @param idToken 구글 로그인으로 획득한 ID token
 */
export async function postGoogleLogin(idToken: string): Promise<GoogleLoginData> {
  const res = (await apiClient({
    url: '/auth/google',
    method: 'POST',
    data: { idToken },
  })) as GoogleLoginResponse;

  return res.data;
}
