import { AxiosRequestConfig, create } from 'axios';

import { env } from './env';

export const axiosInstance = create({
  baseURL: env.apiUrl || undefined,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiClient = async (config: AxiosRequestConfig) => {
  const response = await axiosInstance(config);

  return response.data;
};

/** JWT 연동 시 apiClient.interceptors.request에 Bearer 추가 */
export function setAuthToken(token: string | null) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}
