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

/** 단순 카테고리-맞춤 휴리스틱: 상품명에 카테고리 키워드가 있는지 약하게 검사 */
export function looseCategoryFit(category: CategoryId, title: string): boolean {
  if (!title) return true; // 판단 불가 → 통과
  const t = title.toLowerCase();
  const buckets: Record<CategoryId, RegExp[]> = {
    hat: [/모자|캡|버킷|비니|hat|cap|beanie/i],
    outer: [/자켓|재킷|코트|패딩|점퍼|아우터|jacket|coat|padding|outer/i],
    top: [
      /티셔츠|티|셔츠|니트|맨투맨|후드|상의|유니폼|져지|저지|폴로|tee|shirt|knit|hoodie|sweater|jersey|polo/i,
    ],
    bottom: [/팬츠|바지|치마|스커트|쇼츠|레깅스|하의|pants|shorts|skirt|jean/i],
    shoes: [/신발|운동화|스니커즈|로퍼|부츠|샌들|구두|shoes|sneaker|boot|sandal/i],
  };
  return buckets[category].some((re) => re.test(t));
}
