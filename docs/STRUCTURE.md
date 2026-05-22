# 디렉토리 구조

## app/ — 라우트

| 경로 | 설명 |
|------|------|
| `(auth)/login` | 로그인 |
| `(tabs)/fitting` | 가상 피팅 · 옷장 |
| `(tabs)/explore` | WebView COPY (①~⑥) |
| `(tabs)/explore/crop` | 영역 선택 + ✓ |
| `(tabs)/feed` | OOTD (양희진) |
| `(tabs)/profile` | 마이 · 체형 |

## src/features/webview — COPY 플로우

1. ① `malls.ts` — 몰 선택
2. ②③ `shop-webview` — 탐색
3. ④ `category-sidebar` + `use-copy-session`
4. ⑤ `crop` 화면
5. ⑥ SAVE/Cancel — `save-look.ts` (스펙 확정 후)

## 규칙

- `app/**/*.tsx`: default export, Screen import만
- feature 간 import: `@/features/...` 또는 `@/components/...`
- Orval 생성물: `src/types/generated/`
