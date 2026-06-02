import { env } from '@/lib/env';

// 구글 OAuth "웹 클라이언트 ID" — 백엔드가 idToken 검증 시 쓰는 값과 동일해야 한다(audience 일치).
// 값은 .env의 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID에서 주입(공개 값, 비밀 아님).
export const GOOGLE_WEB_CLIENT_ID = env.googleWebClientId;
