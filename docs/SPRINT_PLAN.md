# Clothing-Fit FE · 스프린트 계획

> **MVP 마감:** 2026년 6월 19일 (금)  
> **작업 시간:** 평일 09:00 ~ 18:00 (주말 제외)  
> **FE 인원:** 3명 (이지환, 양희진, 김인수)  
> **개발 방식:** Sprint 1은 핵심 플로우 3명 협업 → Sprint 2~3 feature 분담 → Sprint 3~4 마무리·발표

---

## 전체 일정 한눈에

| 구간 | 기간 | 한 줄 목표 |
|------|------|------------|
| **Sprint 1** | 5/26 (월) ~ 6/5 (목) | explore → fitting **핵심 E2E PoC** (3명 함께) |
| **Sprint 2~3** | 6/9 (월) ~ 6/12 (목) | **feature 분담** 개발 · QA · preview **배포** |
| **Sprint 3~4** | 6/12 (목) ~ 6/19 (금) | **개발 마무리** · 버그 수정 · **발표자료** · MVP 데모 |

```
5/26 ═══════ Sprint 1 ═══════ 6/5
              │ 3명 협업 · COPY→피팅 PoC
              ▼
6/9  ═══ Sprint 2~3 ═══ 6/12
              │ feature 분담 · QA · 배포
              ▼
6/12 ═══════ Sprint 3~4 ═══════ 6/19
              │ 마무리 · 발표 · MVP 데모
```

---

## MVP 범위 (FE)

| # | 기능 | 담당 (Sprint 2~부터) |
|---|------|---------------------|
| 1 | WebView COPY + 스크래핑 | 이지환 (+ support) |
| 2 | AI 가상 피팅 (2D/3D) + 옷장 | 이지환 |
| 3 | OOTD 소셜 피드 | 양희진 |
| 4 | 로그인 · 프로필 · 체형 | 김인수 |

---

# Sprint 1 (5/26 ~ 6/5)

## 목표

**「쇼핑몰에서 COPY → (mock 가능) AI 피팅 → 결과 화면」** 까지 end-to-end로 **한 번** 돌아가는 PoC 완성.

BE API가 없어도 mock으로 화면·플로우를 먼저 증명한다.

## 협업 원칙 (3명 전원)

### 1) Daily 스탠드업 — explore → fitting

| 항목 | 내용 |
|------|------|
| **시간** | 평일 09:00, 15분 |
| **장소** | Discord / Zoom / 대면 |
| **범위** | **explore 탭 · fitting 탭**만 (COPY, WebView, crop, SSE, 결과) |
| **공유 내용** | 어제 한 일 / 오늘 할 일 / 블로커 (BE, WebView, 스크래핑 등) |

Sprint 1 동안 **feed·profile은 스탠드업에서 다루지 않음** (Sprint 2~3에서 본격 시작).

### 2) PR — 작은 단위, 매일 merge

| 규칙 | 설명 |
|------|------|
| **PR 크기** | 1 Story 또는 half-day 분량 (300줄 이하 권장) |
| **merge 주기** | **당일 merge** — overnight long-lived branch 금지 |
| **브랜치** | `feat/FE-xxx-짧은설명` |
| **리뷰** | 1명 이상 approve 후 merge |
| **충돌 방지** | 같은 파일(webview, fitting) 동시 수정 시 **페어 또는 순서** 미리 합의 |

### 3) feature flag / mock API — BE 대기 최소화

| 방법 | 용도 |
|------|------|
| **mock API** | `/items/extract`, `/fitting/start`, SSE stream → 로컬 mock 또는 MSW |
| **feature flag** | 3D 뷰어, SAVE 일괄 POST 등 **스펙 미확정** 기능은 flag로 on/off |
| **`.env`** | `EXPO_PUBLIC_API_URL` — BE 준비 전 mock server URL |

BE Swagger가 나오면 Orval 1회 실행. **Sprint 1은 mock으로 UI·플로우 우선.**

## Sprint 1 작업 목록

### WebView COPY (explore)

- [ ] ① 이커머스 선택 탭 (무신사 / 29CM / 지그재그)
- [ ] ② URL 바 · 뒤로가기 · X
- [ ] ③ WebView 본문
- [ ] ④ 카테고리 사이드바 (모자·아웃터·상의·하의·신발) · 체크 · 삭제
- [ ] ⑤ COPY → crop 화면 (영역 선택 + ✓)
- [ ] inject PoC — **몰 1곳** 상의 치수 스크래핑 (실패 UX 포함)

### Fitting (fitting 탭)

- [ ] 피팅 job 화면 (`[jobId]`)
- [ ] SSE 진행 UI (react-native-sse or mock stream)
- [ ] COPY 완료 → fitting start → 결과(placeholder) **연결**

### Infra

- [ ] mock API 레이어 정리
- [ ] (선택) BE Swagger → Orval 1차 generate

## Sprint 1 완료 기준 (Definition of Done)

- [ ] 데모: 몰 1곳 상세 → COPY → crop → 피팅 진행 → 결과 화면
- [ ] PR이 main에 merge, 3명 모두 pull 후 동일 화면 확인
- [ ] 스크래핑 실패 시 사용자에게 안내 (크래시 없음)
- [ ] SAVE/Cancel/POST 규칙 — **팀·BE와 초안 합의** (구현은 Sprint 2~3)

## Sprint 1 Review

- **일시:** 6/5 (목) 17:00
- **내용:** E2E PoC 시연, Sprint 2~3 backlog 확정

---

# Sprint 2~3 (6/9 ~ 6/12)

## 목표

MVP 4기능을 **담당자별로 1버전씩** 완성하고, **1차 통합 QA** 후 **preview 배포**(Android internal APK).

## 협업 원칙

| 항목 | 내용 |
|------|------|
| **개발** | **feature별 owner** — 병렬 개발 |
| **Daily** | 09:00, 15분 — 전 feature 진행·블로커 |
| **통합** | **6/11 (수)** half-day — COPY → 피팅 → 옷장 → (선택) feed |
| **QA** | Story AC + E2E 체크리스트 |
| **배포** | EAS preview build, 실기기 WebView·SSE 테스트 |

## 담당 분담

| Owner | Feature | Sprint 2~3 목표 |
|-------|---------|-----------------|
| **이지환** | WebView, Fitting, Closet | SAVE 규칙 반영, 몰 2곳째 inject, 2D 결과, 옷장 CRUD, 3D PoC |
| **양희진** | Feed | 그리드, 상세, 좋아요, 댓글 |
| **김인수** | Auth, Profile | JWT 로그인, 체형 입력, 프로필·설정, auth guard |

## Sprint 2~3 작업 목록

### 이지환 — WebView / Fitting / Closet

- [ ] SAVE / Cancel / POST 규칙 확정 및 API 연동
- [ ] inject 2번째 쇼핑몰
- [ ] fitting 2D 결과 이미지 표시
- [ ] closet 목록 · 저장 · 삭제
- [ ] 3D 뷰어 PoC (실패 시 2D fallback 유지)

### 양희진 — Feed

- [ ] OOTD 3단 그리드 + pagination
- [ ] 게시물 상세 + 태그 상품
- [ ] 좋아요 · 댓글

### 김인수 — Auth / Profile

- [ ] 로그인 · JWT (SecureStore)
- [ ] `(auth)` ↔ `(tabs)` 분기
- [ ] 체형 정보 입력/수정
- [ ] 프로필 · 설정 · 로그아웃

### 공통 — QA · 배포

- [ ] E2E 테스트 시나리오 문서
- [ ] Critical / High 버그 수정
- [ ] EAS preview APK 배포
- [ ] empty / error state 1차

## Sprint 2~3 완료 기준

- [ ] MVP 4기능 **각각** “한 번은 동작” 확인
- [ ] preview APK 팀원 실기기 설치 가능
- [ ] Critical 버그 0 (데모 막는 이슈 없음)
- [ ] 알려진 이슈 목록 (Notion/Jira) 작성

## Sprint 2~3 Review

- **일시:** 6/12 (목) 17:00
- **내용:** feature별 시연, preview APK, Sprint 3~4 backlog

---

# Sprint 3~4 (6/12 ~ 6/19)

## 목표

**MVP 데모 가능 상태**로 개발을 마무리하고, **발표자료**를 정리한다. (6/19 MVP 마감)

## 협업 원칙

| 항목 | 내용 |
|------|------|
| **개발** | 신규 기능 최소 — **버그·UX polish** 위주 |
| **Daily** | 09:00, 15분 — 마감 D-day, 남은 이슈만 |
| **발표** | 데모 시나리오 · 스크린샷 · 아키텍처 — **전원 분담** |
| **코드 freeze** | 6/18 (목) 18:00 — Critical 외 merge 제한 (팀 합의) |

## Sprint 3~4 작업 목록

### 개발 마무리

- [ ] Critical / High 버그 전부 처리
- [ ] 스크래핑 실패 · 네트워크 오류 UX
- [ ] 로딩 · empty state 정리
- [ ] (선택) production build / Play internal track
- [ ] README · 알려진 이슈 (몰 지원 수, 3D 한계 등)

### QA

- [ ] MVP 데모 시나리오 1~2개 고정
- [ ] 6/18 (목) **데모 리허설** (전원)
- [ ] 실기기 WebView · SSE · 로그인 최종 확인

### 발표자료

- [ ] 서비스 소개 (문제 · 해결 · 차별점)
- [ ] 데모 플로우 (COPY → 피팅 → 옷장)
- [ ] FE 아키텍처 (Expo Router · features · WebView)
- [ ] 스크린샷 / 짧은 녹화
- [ ] 한계 & 향후 계획 (몰 확장, 3D 고도화)

## Sprint 3~4 완료 기준 (MVP 마감)

- [ ] **6/19** MVP 데모 가능
- [ ] 발표자료 초안 완료
- [ ] 팀·외부(프로그래머스) 레포 코드 mirror push 최신
- [ ] 이슈: Critical 0, 알려진 Medium/Low는 문서화

## Final Review

- **일시:** 6/19 (금) — MVP 마감 · 발표

---

## 협업 vs 분담 요약

| 구간 | 방식 | 이유 |
|------|------|------|
| **Sprint 1** | 3명 **함께** explore → fitting | 핵심 플로우·기술 리스크(WebView, scrape, SSE) 먼저 unblock |
| **Sprint 2~3** | **feature owner** 병렬 | feed / auth / webview·fitting 동시 진행 |
| **Sprint 3~4** | **전원** 마무리 · QA · 발표 | 통합 품질 · 데모 · 문서 |

---

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| 스크래핑 DOM 변경 | MVP는 몰 1~2곳, 실패 시 수동 입력 fallback |
| 3D 일정 지연 | 2D만으로도 데모 가능 (3D는 bonus) |
| BE API 지연 | Sprint 1~2 mock 유지, contract 먼저 |
| WebView Expo Go 제한 | Sprint 2~ development build 사용 |

---

## 참고

- FE 폴더 구조: [STRUCTURE.md](./STRUCTURE.md)
- 상세 로드맵: [ROADMAP.md](./ROADMAP.md)
- Git: 팀 레포 Issues/PR, push는 팀 + (설정 시) 프로그래머스 mirror
