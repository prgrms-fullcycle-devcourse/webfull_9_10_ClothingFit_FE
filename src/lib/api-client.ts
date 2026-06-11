import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { env } from './env';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth-storage';

export const axiosInstance = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Refresh Token Queue/Lock ───────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// ── Request Interceptor: SecureStore에서 토큰 꺼내 헤더에 붙임 ─────────────

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: TOKEN_EXPIRED → refresh → 재시도 ────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry;

    if (!isTokenExpired) {
      return Promise.reject(error);
    }

    // 이미 refresh 중이면 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('리프레시 토큰 없음');

      // axiosInstance 우회 — 인터셉터 무한루프 방지
      const { data } = await axios.post(
        `${env.apiUrl}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      // Rotation: 새 accessToken + refreshToken 모두 저장
      await setTokens(data.accessToken, data.refreshToken);
      setAuthToken(data.accessToken);

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      setAuthToken(null);
      router.replace('/(auth)/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Mutator ───────────────────────────────────────────────────────────────

/**
 * Orval 생성 코드 및 수작업 API가 공통으로 쓰는 mutator.
 * config 한 개를 받아 응답 본문(response.data)만 Promise<T>로 반환한다.
 */
export const apiClient = <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  // multipart 업로드(FormData) 보정.
  // RN 네이티브(Android OkHttp / iOS)는 FormData를 multipart 본문으로 만들 때 'Content-Type'
  // 헤더가 있어야 거기에 boundary를 스스로 붙인다. 헤더를 지우면 Android에서 MediaType 파싱이
  // 실패해 'Network Error'(ERR_NETWORK)가 난다. 또 기본값 'application/json'이 남으면 axios가
  // FormData를 JSON으로 직렬화해버린다. → 'multipart/form-data'로 명시한다(boundary는 네이티브가 추가).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers = { ...config.headers, 'Content-Type': 'multipart/form-data' };
  }
  return axiosInstance(config).then((response) => response.data as T);
};

// ── Auth 변경 구독 (SSE 등 토큰 의존 연결 재설정용) ──────────────────────────

let authVersion = 0;
let isAuthed = false; // 현재 인증 여부(인메모리) — 로그인/로그아웃 시 즉시 반영
const authListeners = new Set<() => void>();

/** setAuthToken 호출(로그인/로그아웃) 때마다 바뀌는 버전. useSyncExternalStore용 */
export function getAuthVersion() {
  return authVersion;
}

/** 현재 인증 여부(동기 스냅샷). 인증 게이트의 useSyncExternalStore용 */
export function getIsAuthenticated() {
  return isAuthed;
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
  isAuthed = token !== null;
  authVersion += 1;
  authListeners.forEach((l) => l());
}
