const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export const env = {
  apiUrl,
  isApiConfigured: apiUrl.length > 0,
  googleWebClientId,
} as const;
