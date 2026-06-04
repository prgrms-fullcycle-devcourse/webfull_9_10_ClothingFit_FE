import type { CategoryId } from '../constants/categories';
import type { ScrapeProductData } from '../inject/protocol';

/**
 * COPY 트리거 시 만들어지는 1회성 작업 컨텍스트.
 * - capturedUri: WebView를 캡처한 PNG (크롭 화면에서 보여줌)
 * - scrapePromise: 백그라운드 스크래핑. 크롭 완료 시점에 await.
 * - category: 어느 슬롯에 저장할지
 */
export type PendingScrape = {
  category: CategoryId;
  capturedUri: string;
  /** 표시용. 실제 await는 promise. */
  status: 'pending' | 'ok' | 'fail';
  /** 결과 (성공 시) */
  data?: ScrapeProductData;
  /** 실패 사유 */
  error?: string;
  scrapePromise: Promise<ScrapeProductData>;
};

let current: PendingScrape | null = null;
const listeners = new Set<() => void>();

export function setPendingScrape(p: PendingScrape | null) {
  current = p;
  listeners.forEach((l) => l());
}

export function getPendingScrape() {
  return current;
}

export function subscribePendingScrape(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 무신사 공식 카테고리(상의 001/아우터 002/하의 003/신발 103) 품목명 기반 키워드
const CATEGORY_KEYWORDS: Record<CategoryId, RegExp> = {
  hat: /모자|캡|버킷|비니|(?:^|\s)hat(?:\s|$)|(?:^|\s)cap(?:\s|$)|beanie/i,
  outer:
    /자켓|재킷|코트|패딩|점퍼|아우터|집업|블루종|라이더스|레더|블레이저|카디건|베스트|사파리|헌팅|트러커|스타디움|코치|아노락|플리스|뽀글이|무스탕|ma-?1|jacket|coat|padding|outer|blouson|rider|leather|blazer|cardigan|vest|safari|trucker|stadium|fleece|coach|anorak/i,
  // `티` 단독 패턴 제거 — "빈티지·멀티·오드티" 등 신발명에 오탐
  top: /티셔츠|셔츠|블라우스|니트|스웨터|맨투맨|스웨트|후드|피케|카라|폴로|반팔|긴팔|반소매|긴소매|민소매|나시|헨리넥|상의|유니폼|져지|저지|tee|shirt|blouse|knit|sweater|hoodie|jersey|polo|pique/i,
  bottom:
    /팬츠|바지|청바지|데님|치마|스커트|쇼츠|슬랙스|조거|트레이닝|레깅스|점프\s*슈트|오버올|하의|pants|shorts|skirt|jean|denim|slacks|jogger|legging|overall|jumpsuit/i,
  shoes:
    /신발|운동화|스니커즈|스포츠화|로퍼|부츠|워커|샌들|슬리퍼|구두|뮬|클로그|슬라이드|플립플롭|shoes|sneaker|boot|sandal|slipper|loafer|walker|mule|clog|slide|flip/i,
};

/**
 * 카테고리-맞춤 휴리스틱.
 * - 제목이 어떤 카테고리에도 안 걸리면 → 판단 보류(통과). 무신사 제목은 종류 단어를
 *   생략하는 경우가 많아, 단순히 "선택 카테고리 단어가 없다"고 막으면 오차단이 많다.
 * - 제목이 '다른' 카테고리에만 명백히 걸릴 때만 잘못된 캡처로 보고 차단한다.
 */
export function looseCategoryFit(category: CategoryId, title: string): boolean {
  if (!title) return true;
  const t = title.toLowerCase();

  const matched = (Object.keys(CATEGORY_KEYWORDS) as CategoryId[]).filter((c) =>
    CATEGORY_KEYWORDS[c].test(t),
  );

  if (matched.length === 0) return true; // 아무것도 못 알아봄 → 통과
  if (matched.includes(category)) return true; // 선택 카테고리에 걸림 → 통과
  return false; // 다른 카테고리에만 걸림 → 차단
}
