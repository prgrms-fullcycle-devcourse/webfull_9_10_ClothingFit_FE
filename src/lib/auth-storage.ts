import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ID_KEY = 'user_id';
const LAST_PROVIDER_KEY = 'last_login_provider';

export type SocialProvider = 'kakao' | 'google';

/** 마지막으로 로그인한 소셜 제공자. 로그아웃해도 유지(다음 로그인 화면에서 안내용). */
export async function getLastProvider(): Promise<SocialProvider | null> {
  const v = await SecureStore.getItemAsync(LAST_PROVIDER_KEY);
  return v === 'kakao' || v === 'google' ? v : null;
}

export async function setLastProvider(provider: SocialProvider): Promise<void> {
  await SecureStore.setItemAsync(LAST_PROVIDER_KEY, provider);
}

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

  const token = await getAccessToken();
  if (!token) return null;
  return saveUserIdFromToken(token);
}

export async function saveUserIdFromToken(token: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    const userId = (payload.userId ?? payload.sub) as string | undefined;

    if (userId) {
      await SecureStore.setItemAsync(USER_ID_KEY, userId);
      return userId;
    }
    return null;
  } catch (e) {
    if (__DEV__) console.warn('[auth] JWT decode failed:', e);
    return null;
  }
}
