import axios, { type AxiosRequestConfig } from 'axios';

import { env } from './env';

export const axiosInstance = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Orval mutator — (url, RequestInit) → { data, status, headers } */
export const apiClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const method = (options?.method ?? 'GET').toUpperCase();
  const config: AxiosRequestConfig = {
    url,
    method,
    signal: options?.signal ?? undefined,
    headers: options?.headers as AxiosRequestConfig['headers'],
  };

  if (options?.body && method !== 'GET' && method !== 'HEAD') {
    config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  }

  const response = await axiosInstance.request(config);

  return {
    data: response.data,
    status: response.status,
    headers: response.headers,
  } as T;
};

/** JWT 연동 시 axiosInstance interceptor에 Bearer 추가 */
export function setAuthToken(token: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}
