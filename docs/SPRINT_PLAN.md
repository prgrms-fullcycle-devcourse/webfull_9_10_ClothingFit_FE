# Clothing-Fit FE · 스프린트 계획

> **MVP 마감:** 2026년 6월 19일 (금)  
> **작업 시간:** 평일 09:00 ~ 18:00 (주말 제외)  
> **FE 인원:** 3명 (이지환, 양희진, 김인수)  
> **개발 방식:** Sprint 1은 COPY→피팅 E2E PoC(3명 협업) → Sprint 2~3 feature owner 분담 → Sprint 3~4 마무리·발표  
> **서포트:** 본인 feature AC를 먼저 충족한 뒤, **일찍 끝난 사람이 늦게 끝난 사람 feature를 지원**

---

## 전체 일정 한눈에

| 구간           | 기간                  | 한 줄 목표                                            |
| -------------- | --------------------- | ----------------------------------------------------- |
| **Sprint 1**   | 5/26 (월) ~ 6/5 (목)  | explore → fitting **E2E PoC** (3명 협업, 이지환 리드) |
| **Sprint 2~3** | 6/9 (월) ~ 6/12 (목)  | **feature owner** 병렬 개발 · QA · preview **배포**   |
| **Sprint 3~4** | 6/12 (목) ~ 6/19 (금) | **개발 마무리** · 버그 수정 · **발표자료** · MVP 데모 |

```
5/26 ═══════ Sprint 1 ═══════ 6/5
              │ 3명 협업 · COPY→피팅 PoC (리드: 이지환)
              ▼
6/9  ═══ Sprint 2~3 ═══ 6/12
              │ WebView·Fitting / Feed·Closet / Login·Homepage
              ▼
6/12 ═══════ Sprint 3~4 ═══════ 6/19
              │ 마무리 · 서포트 · 발표 · MVP 데모
```

---

## MVP feature 담당 (Sprint 2~부터)

| 담당       | feature                  | 주요 화면·경로                     |
| ---------- | ------------------------ | ---------------------------------- |
| **이지환** | **WebView**, **Fitting** | `(tabs)/explore`, `(tabs)/fitting` |
| **양희진** | **Feed**, **Closet**     | `(tabs)/feed`, `(tabs)/closet`     |
| **김인수** | **Login**, **Homepage**  | `(auth)/`, `(tabs)/home`           |

### 서포트 규칙

| 순서 | 내용                                                                  |
| ---- | --------------------------------------------------------------------- |
| 1    | **본인 owner feature** Story AC 완료가 우선                           |
| 2    | 여유가 생기면 **다른 owner 블로커**부터 지원 (Daily에서 합의)         |
| 3    | 지원 시에도 **해당 feature 브랜치/PR**은 owner 리뷰·merge             |
| 4    | 통합일(6/11) 전 — COPY→피팅→옷장 연결은 **이지환 ↔ 양희진** 페어 우선 |

### 연동 경계 (충돌 방지)

| 경계             | Owner A          | Owner B         | 합의 사항                      |
| ---------------- | ---------------- | --------------- | ------------------------------ |
| COPY → 옷장 저장 | 이지환 (WebView) | 양희진 (Closet) | SAVE API·세션·목록 갱신 시점   |
| 피팅 → 옷 선택   | 이지환 (Fitting) | 양희진 (Closet) | 옷장 item id / mock 스키마     |
| 로그인 → 탭 진입 | 김인수 (Login)   | 전원            | auth guard, `(tabs)` 진입 조건 |
| 홈 ↔ 피드        | 김인수 (Home)    | 양희진 (Feed)   | 인기글 API·네비게이션          |

---

# Sprint 1 (5/26 ~ 6/5) — 3명 함께

## 한 줄 목표

**쇼핑몰 COPY → (mock) AI 피팅 → 결과 화면**까지 데모 **1회** (BE 없어도 mock으로 플로우 검증).

## 운영 방식

| 항목             | 내용                                                                |
| ---------------- | ------------------------------------------------------------------- |
| **리드**         | **이지환** — explore·fitting 기술·일정 조율                         |
| **Daily**        | 평일 09:00, 15분 — **explore·fitting만** (COPY, WebView, crop, SSE) |
| **PR**           | 작은 단위, **당일 merge**, 1명 이상 리뷰                            |
| **mock API**     | extract / fitting / SSE — BE 없어도 플로우 검증                     |
| **feature flag** | SAVE 규칙·3D 등 미확정 기능 on/off                                  |

Sprint 1 스탠드업에서 **feed·closet·home·login**은 다루지 않음 (Sprint 2~3 본격).  
다만 **6/3~6/5** 여유 시 양희진·김인수는 각자 mock 뼈대 **선행 작업** 가능 (아래 참고).

## 주요 작업 (전원 협업 · 이지환 리드)

### WebView COPY (explore)

- [ ] ① 이커머스 선택 탭 (무신사 / 29CM / 지그재그)
- [ ] ② URL 바 · 뒤로가기 · X
- [ ] ③ WebView 본문
- [ ] ④ 카테고리 사이드바 · 체크 · 삭제
- [ ] ⑤ COPY → crop (영역 선택 + ✓)
- [ ] inject **몰 1곳** PoC (실패 UX 포함)

### Fitting (fitting 탭)

- [ ] 피팅 job 화면 (`[jobId]`)
- [ ] SSE 진행 UI (mock stream)
- [ ] COPY 완료 → fitting start → 결과(placeholder) **연결**

### Infra

- [ ] mock API 레이어 정리
- [ ] (선택) BE Swagger → Orval 1차 generate

### 선행 작업 (선택, Sprint 1 말미)

| 담당   | 선행                  | 비고                              |
| ------ | --------------------- | --------------------------------- |
| 양희진 | closet 목록·상세 mock | Sprint 2 본작업, SAVE 연동은 6/9~ |
| 김인수 | login·home mock 화면  | Sprint 2 JWT·guard                |

## Sprint 1 완료 기준 (6/5)

- [ ] **E2E PoC 시연 가능** (COPY → 피팅 → 결과)
- [ ] PR main merge, 3명 동일 화면 확인
- [ ] 스크래핑 실패 시 안내 (크래시 없음)
- [ ] SAVE/Cancel/POST 규칙 **초안 합의** (구현은 Sprint 2~3, owner: 이지환·양희진)

## Sprint 1 Review

- **일시:** 6/5 (목) 17:00
- **내용:** E2E PoC 시연, Sprint 2~3 backlog·담당 확정

---

# Sprint 2~3 (6/9 ~ 6/12) — feature 분담

## 한 줄 목표

**MVP feature 각 1버전** + **1차 통합 QA** + **preview APK** (Android).

## 운영 방식

| 항목       | 내용                                                              |
| ---------- | ----------------------------------------------------------------- |
| **개발**   | **feature owner** 병렬                                            |
| **Daily**  | 09:00, 15분 — **전 feature** 진행·블로커·**서포트 필요 여부**     |
| **통합**   | **6/11 (수) half-day** — Login → Home · COPY → 피팅 → 옷장 · Feed |
| **QA**     | Story AC + E2E 체크리스트                                         |
| **배포**   | EAS preview (Android), 실기기 WebView·SSE 테스트                  |
| **서포트** | 일찍 끝난 owner → Daily에서 지원 대상·범위 합의                   |

## 담당 분담

| 담당       | feature          | Sprint 2~3 목표                                               |
| ---------- | ---------------- | ------------------------------------------------------------- |
| **이지환** | WebView, Fitting | SAVE 규칙 반영, inject 2번째 몰, 2D 결과, SSE·BE 연동, 3D PoC |
| **양희진** | Feed, Closet     | 옷장 CRUD·COPY 저장 연동, OOTD 그리드·상세·좋아요·댓글        |
| **김인수** | Login, Homepage  | JWT·소셜 로그인, auth guard, 홈(인기글·팔로워) API 연동       |

## Sprint 2~3 작업 목록

### 이지환 — WebView / Fitting

- [ ] SAVE / Cancel / POST 규칙 확정 및 API 연동 (양희진 closet과 스키마 합의)
- [ ] inject 2번째 쇼핑몰
- [ ] fitting 2D 결과 이미지 표시
- [ ] SSE 피팅 진행 · job 상태 · 결과 화면
- [ ] 3D 뷰어 PoC (실패 시 2D fallback)

### 양희진 — Feed / Closet

- [ ] closet 목록 · 상세 · 저장 · 삭제 (COPY SAVE 연동)
- [ ] OOTD 3단 그리드 + pagination
- [ ] 게시물 상세 + 태그 상품
- [ ] 좋아요 · 댓글

### 김인수 — Login / Homepage

- [ ] 로그인 · 회원가입 · JWT (SecureStore)
- [ ] `(auth)` ↔ `(tabs)` 분기 (auth guard)
- [ ] 홈 탭 — 인기글 · 인기 팔로워 (mock → API)
- [ ] (필요 시) 마이/프로필 진입 가드 — 로그인 연동만; 상세 프로필은 지원 또는 후순위

### 공통 — QA · 배포 · 서포트

- [ ] E2E 테스트 시나리오 문서
- [ ] 6/11 통합 — 위 연동 경계 시나리오 실행
- [ ] Critical / High 버그 수정
- [ ] EAS preview APK 배포
- [ ] empty / error state 1차
- [ ] **서포트 로그** — 누가 어떤 feature를 지원했는지 Daily 기록

## Sprint 2~3 완료 기준 (6/12)

- [ ] **WebView·Fitting / Feed·Closet / Login·Home** 각각 “한 번은 동작”
- [ ] COPY → 피팅 → 옷장 저장 **통합 1회** 성공
- [ ] preview APK 팀원 실기기 설치 가능
- [ ] **Critical 버그 0**
- [ ] 알려진 이슈 목록 (Notion/Jira)

## Sprint 2~3 Review

- **일시:** 6/12 (목) 17:00
- **내용:** feature별 시연, preview APK, Sprint 3~4 backlog

---

# Sprint 3~4 (6/12 ~ 6/19) — 마무리 · 발표

## 한 줄 목표

**MVP 데모 + 발표자료** (6/19 마감).

## 운영 방식

| 항목            | 내용                                                  |
| --------------- | ----------------------------------------------------- |
| **개발**        | 신규 기능 최소 — **버그·UX polish**                   |
| **Daily**       | 09:00, 15분 — 마감 D-day, 남은 이슈·**서포트**        |
| **코드 freeze** | **6/18 (목) 18:00** (팀 합의, Critical 외 merge 제한) |
| **리허설**      | **6/18** 데모 리허설 (전원)                           |
| **서포트**      | 미완 owner feature 우선 — 전원 투입                   |

## 작업

### 개발 마무리

- [ ] Critical / High 버그 처리
- [ ] 스크래핑 실패 · 네트워크 오류 UX
- [ ] 로딩 · empty state 정리
- [ ] README · 알려진 이슈

### QA

- [ ] MVP 데모 시나리오 1~2개 고정  
      예: `로그인 → 홈 → COPY → 피팅 → 옷장 → 피드`
- [ ] 실기기 WebView · SSE · 로그인 최종 확인

### 발표자료 (전원 분담)

- [ ] 서비스 소개 (문제 · 해결 · 차별점)
- [ ] 데모 플로우 (owner별 1분씩)
- [ ] FE 아키텍처 (Expo Router · features)
- [ ] 스크린샷 / 짧은 녹화
- [ ] 한계 & 향후 (몰 확장, 3D, 프로필·체형 등)

## Sprint 3~4 완료 기준 (6/19)

- [ ] **MVP 데모 가능**
- [ ] **발표자료 초안 완료**
- [ ] 팀·프로그래머스 mirror push 최신
- [ ] Critical 0, Medium/Low는 문서화

## Final Review

- **일시:** 6/19 (금) — MVP 마감 · 발표

---

## 협업 vs 분담 요약

| 구간           | 방식                                  | 이유                                        |
| -------------- | ------------------------------------- | ------------------------------------------- |
| **Sprint 1**   | 3명 **함께** COPY→피팅 (리드: 이지환) | 핵심 리스크·플로우 먼저 unblock             |
| **Sprint 2~3** | **owner 분담** + **교차 서포트**      | Feed·Closet / Login·Home 병렬, 늦은 쪽 지원 |
| **Sprint 3~4** | **전원** 마무리 · QA · 발표           | 통합 품질 · 데모                            |

---

## 리스크 & 대응

| 리스크              | 대응                                        |
| ------------------- | ------------------------------------------- |
| COPY↔옷장 연동 지연 | 6/11 통합 전 이지환·양희진 mock 스키마 고정 |
| owner 일정 차이     | Daily 서포트 합의, AC 우선순위 조정         |
| 스크래핑 DOM 변경   | MVP 몰 1~2곳, fallback UX                   |
| 3D 일정 지연        | 2D만으로 데모 (3D bonus)                    |
| BE API 지연         | mock 유지, contract 우선                    |
| Expo Go SDK         | dev build / SDK 54 Expo Go                  |

---

## 참고

- Mock UI: [MOCK_SKELETON.md](./MOCK_SKELETON.md)
- FE 폴더 구조: [STRUCTURE.md](./STRUCTURE.md)
- 상세 로드맵: [ROADMAP.md](./ROADMAP.md)
- Git: 팀 레포 Issues/PR, push는 팀 + (설정 시) 프로그래머스 mirror
