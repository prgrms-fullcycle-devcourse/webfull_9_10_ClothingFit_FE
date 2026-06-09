import axios, { type AxiosRequestConfig } from 'axios';

import { env } from './env';

export const axiosInstance = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Orval 생성 코드 및 수작업 API가 공통으로 쓰는 mutator.
 * config 한 개를 받아 응답 본문(response.data)만 Promise<T>로 반환한다.
 */
export const apiClient = <T = unknown>(config: AxiosRequestConfig): Promise<T> =>
  axiosInstance(config).then((response) => response.data as T);

// 인증 변경(로그인/로그아웃) 구독 — SSE 등 토큰에 의존하는 연결이 재설정되도록.
let authVersion = 0;
const authListeners = new Set<() => void>();

/** setAuthToken 호출(로그인/로그아웃) 때마다 바뀌는 버전. useSyncExternalStore용 */
export function getAuthVersion() {
  return authVersion;
}

export function subscribeAuthChange(listener: () => void) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

/** JWT 연동 시 axiosInstance interceptor에 Bearer 추가 */
export function setAuthToken(token: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
  authVersion += 1;
  authListeners.forEach((l) => l());
}
