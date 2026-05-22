const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

export const env = {
  apiUrl,
  isApiConfigured: apiUrl.length > 0,
} as const;
