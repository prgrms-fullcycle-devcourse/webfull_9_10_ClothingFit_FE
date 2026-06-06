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
export const apiClient = <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  // multipart 업로드(FormData): Content-Type을 수동 지정하면 boundary가 빠져 서버가 파싱 못함.
  // 헤더를 비워 RN/axios가 boundary 포함 multipart 헤더를 자동 설정하도록 한다.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    delete (config.headers as Record<string, unknown>)['Content-Type'];
  }
  return axiosInstance(config).then((response) => response.data as T);
};

/** JWT 연동 시 axiosInstance interceptor에 Bearer 추가 */
export function setAuthToken(token: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}
