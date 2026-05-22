# 프론트엔드 작업 로드맵

## Phase 0 — 기초 (현재)

- [x] Expo + TypeScript + Expo Router
- [x] 탭 4개 + auth + feature 폴더 뼈대
- [x] COPY 플로우용 `use-copy-session`, constants
- [ ] 팀 공용 레포 push

## Phase 1 — 개발 환경

- [x] NativeWind 설정
- [x] `@/` path alias 팀원 IDE 확인
- [x] `.env` + `lib/api-client.ts`
- [x] TanStack Query + `AppProviders`
- [x] ESLint / Prettier (기본 설정)
- [ ] Orval — BE Swagger URL 연동 후 `npm run generate:api`

## Phase 2 — WebView COPY (이지환)

- [x] `react-native-webview` 설치
- [ ] `shop-webview`, `mall-selector-bar`, `category-sidebar`
- [ ] `inject/musinsa.ts`, `29cm.ts` 스크래핑 PoC
- [ ] crop UI + 이미지 캡처
- [ ] SAVE/Cancel/POST 규칙 확정 후 API 연동

## Phase 3 — 인증 · 프로필

- [x] expo-secure-store 설치 (`lib/auth-storage.ts`)
- [ ] 로그인 · 체형 (`/users/me/body`)
- [ ] auth 가드 → `(tabs)` 분기

## Phase 4 — AI 피팅

- [ ] Orval + Swagger (패키지 설치됨, URL 연동 대기)
- [x] `react-native-sse` 설치
- [x] expo-gl 설치 — 3D 뷰어 PoC

## Phase 5 — 옷장 · 피드

- [ ] closet API
- [ ] feed (양희진)

## Phase 6 — Play 출시

- [ ] EAS development build
- [ ] `android.package` 확정
- [ ] 내부 테스트 APK
- [ ] Play Console 등록
