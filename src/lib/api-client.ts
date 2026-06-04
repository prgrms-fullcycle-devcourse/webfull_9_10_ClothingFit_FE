import { AxiosRequestConfig, create } from 'axios';

import { env } from './env';

export const axiosInstance = create({
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

/** JWT 연동 시 apiClient.interceptors.request에 Bearer 추가 */
export function setAuthToken(token: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}
