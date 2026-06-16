/**
 * WebView inject 스크립트와 RN 사이의 메시지 프로토콜.
 * 양쪽이 같이 import 할 수 있도록 plain TS만 사용 (RN 의존성 X).
 */

export type ScrapeProductData = {
  /** 페이지 URL (inject 시점 location.href) */
  url: string;
  /** 상품명 (og:title 등 — 브랜드·"사이즈&후기" 포함된 원본. 없으면 빈 문자열) */
  title: string;
  /** 브랜드명 (meta product:brand — 깨끗함. 없으면 빈 문자열) */
  brand: string;
  /** 정제된 상품명 (JSON-LD name — 브랜드/쓰레기 없음. 없으면 빈 문자열) */
  name: string;
  /** 대표 이미지 URL (없으면 null) */
  imageUrl: string | null;
  /**
   * 사이즈표: { 사이즈명: { 항목명: 숫자(cm) } }
   * - 키는 사이즈 라벨(S/M/L 등). 표 안에 라벨 컬럼이 없으면 화면 위치로
   *   매칭해 찾고, 그래도 못 찾으면 '사이즈1' 같은 인덱스 키로 폴백.
   * - 값은 측정항목 전부(총장 포함)를 숫자(cm)로 담는다.
   * ex) { 'M': { '총장': 65.5, '어깨너비': 55.5, '가슴단면': 58.5, '소매길이': 19.5 } }
   * 못 찾으면 null
   */
  sizeTable: Record<string, Record<string, number>> | null;
  /**
   * 사이즈표가 이미지(jpg 등)로만 제공될 때 그 이미지 URL.
   * sizeTable이 null이고 이 값이 있으면 RN 쪽에서 OCR(ML Kit) 대상이 된다.
   * 없으면 null.
   */
  sizeChartImageUrl: string | null;
  /**
   * 상품 상세영역의 이미지 URL 후보 목록 (사이즈표일 "가능성"이 있는 것들).
   * 무신사 실측표가 키워드 없는 외부서버 상세이미지(content-img-*)로 오는 경우가
   * 많아, alt/src로는 못 고른다. RN에서 이 후보들을 순서대로 OCR해서
   * 측정 키워드(가슴/허리/총장/cm)가 많은 이미지를 사이즈표로 판별한다.
   * 위→아래(화면 y) 순서로 정렬돼 있다.
   */
  sizeChartCandidates: string[];
};

export type ScrapeMessage =
  | { type: 'scrape:ok'; requestId: string; data: ScrapeProductData }
  | { type: 'scrape:fail'; requestId: string; reason: string }
  | { type: 'scrape:log'; message: string };

export function parseScrapeMessage(raw: string): ScrapeMessage | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.type !== 'string') return null;

    // 타입별 필수 필드 검증 (requestId 없는 ok/fail이 store에서 undefined로 dereference되는 것 방지)
    switch (parsed.type) {
      case 'scrape:ok':
        return typeof parsed.requestId === 'string' &&
          parsed.data &&
          typeof parsed.data === 'object'
          ? (parsed as ScrapeMessage)
          : null;
      case 'scrape:fail':
        return typeof parsed.requestId === 'string' ? (parsed as ScrapeMessage) : null;
      case 'scrape:log':
        return parsed as ScrapeMessage;
      default:
        return null; // 알 수 없는 scrape:* 타입은 무시
    }
  } catch {
    // not ours
  }
  return null;
}
