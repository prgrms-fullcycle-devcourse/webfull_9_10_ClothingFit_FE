const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

export const env = {
  apiUrl,
  isApiConfigured: apiUrl.length > 0,
  /** Gemini 사이즈표 OCR용 (개발 단계 — 배포 시 백엔드로 이전) */
  geminiApiKey,
  isGeminiConfigured: geminiApiKey.length > 0,
} as const;
