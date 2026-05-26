# Mock UI 뼈대 가이드

> **Noto Sans** 전역 폰트 · 실제 API/스크래핑/AI 없음

## 실행

```bash
npm start
```

## 하단 탭 (와이어 기준 5개)

| 탭 | 경로 | 화면 |
|----|------|------|
| 홈 | `/(tabs)/home` | 인기글·인기 팔로워 |
| 옷장 | `/(tabs)/closet` | 나의 옷장 목록·상세 |
| AI 피팅 | `/(tabs)/fitting` | 피팅 허브 → COPY·확인·진행·결과 |
| 커뮤니티 | `/(tabs)/feed` | 그리드·상세·작성 |
| 마이 | `/(tabs)/profile` | 마이·설정·알림 등 |

`explore` (WebView COPY)는 탭에 없음 → **AI 피팅 허브**에서 진입 (`/(tabs)/explore`)

## Mock 데이터

`src/mocks/data.ts`

## TODO (팀이 교체)

- `src/features/webview/inject/` — 실제 스크래핑
- `src/lib/api-client.ts` — BE URL
- `react-native-sse` — 피팅 SSE
- `expo-gl` + Meshy — 3D
- Gemini — 2D 생성

## 폰트

- `@expo-google-fonts/noto-sans`
- UI: `Text`, `TextInput` from `@/components/ui/*`
- Tailwind: `font-sans`, `font-sans-medium`, `font-sans-bold`
