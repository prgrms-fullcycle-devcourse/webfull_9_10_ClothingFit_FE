import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getUserId(): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(USER_ID_KEY);
  if (stored) return stored;

  // 저장된 userId 없으면 액세스 토큰에서 추출 후 저장
  const token = await getAccessToken();
  if (!token) return null;
  await saveUserIdFromToken(token);
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function saveUserIdFromToken(token: string): Promise<void> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>;
    const userId = (payload.userId ?? payload.sub) as string | undefined;
    if (userId) {
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
    }
  } catch {
    // 실패해도 로그인 흐름 유지
  }
}
