import { apiClient } from '@/lib/api-client';

/**
 * 서버에 로그아웃 요청 — refresh token을 무효화한다.
 * DELETE /auth/logout (baseURL의 /api/v1 포함)
 * @param refreshToken 무효화할 refresh token
 */
export async function postLogout(refreshToken: string): Promise<void> {
  await apiClient({
    url: '/auth/logout',
    method: 'DELETE',
    data: { refreshToken },
  });
}
