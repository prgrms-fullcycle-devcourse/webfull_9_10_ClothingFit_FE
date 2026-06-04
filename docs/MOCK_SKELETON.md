# Mock UI 뼈대 가이드

> **Noto Sans / Noto Sans KR** 전역 폰트

## 실행

```bash
npm install
npm start
```

> WebView COPY 캡처(`react-native-view-shot`)는 **Expo Go에서 불안정**할 수 있어요.  
> 실기기 검증은 `eas build --profile development` dev client 권장.

## 하단 탭 (와이어 기준 5개)

| 탭       | 경로              | 화면                            |
| -------- | ----------------- | ------------------------------- |
| 홈       | `/(tabs)/home`    | 인기글·인기 팔로워              |
| 옷장     | `/(tabs)/closet`  | 나의 옷장 목록·상세             |
| AI 피팅  | `/(tabs)/fitting` | 피팅 허브 → COPY·확인·진행·결과 |
| 커뮤니티 | `/(tabs)/feed`    | 그리드·상세·작성                |
| 마이     | `/(tabs)/profile` | 마이·설정·알림 등               |

`explore` (WebView COPY)는 탭에 없음 → **AI 피팅 허브**에서 진입 (`/(tabs)/explore`)

## WebView COPY 플로우 (구현됨)

1. 몰 선택 (무신사 / 29CM / 지그재그) — WebView 로드
2. 사이드바에서 카테고리 선택 (모자·아우터·상의·하의·신발)
3. **COPY** → WebView 캡처 + inject 스크래핑 → crop 화면
4. **완료** → 사이즈표 있으면 저장 / 없으면 Alert 후 이미지만 저장
5. **생성** (슬롯 1개 이상) → 피팅 confirm

| 몰       | WebView | 스크래핑 inject |
| -------- | ------- | --------------- |
| 무신사   | ✅      | ✅ PoC          |
| 29CM     | ✅      | ✅ PoC          |
| 지그재그 | ✅      | ⏳ 준비 중      |

코드: `src/features/webview/` — `shop-webview`, `category-sidebar`, `inject/`

## Mock 데이터 (기타 탭)

`src/mocks/data.ts`

## 아직 mock / TODO

- `react-native-sse` — 피팅 SSE · BE 연동
- `expo-gl` + Meshy — 3D
- Gemini — 2D 생성
- 옷장 SAVE API · 피팅 confirm → BE

## 폰트

- `@expo-google-fonts/noto-sans`, `@expo-google-fonts/noto-sans-kr`
- UI: `Text`, `TextInput` from `@/components/ui/*`
- Tailwind: `font-sans`, `font-sans-medium`, `font-sans-bold`
