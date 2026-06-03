import { apiClient } from '@/lib/api-client';

export type KakaoLoginData = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

export async function KakaoLogin(accessToken: string): Promise<KakaoLoginData> {
  const res = (await apiClient({
    url: '/auth/kakao',
    method: 'POST',
    data: { accessToken },
  })) as { message: string; data: KakaoLoginData };
  return res.data;
}
