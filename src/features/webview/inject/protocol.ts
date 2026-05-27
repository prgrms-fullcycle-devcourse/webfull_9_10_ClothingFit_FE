/**
 * WebView inject 스크립트와 RN 사이의 메시지 프로토콜.
 * 양쪽이 같이 import 할 수 있도록 plain TS만 사용 (RN 의존성 X).
 */

export type ScrapeProductData = {
  /** 페이지 URL (inject 시점 location.href) */
  url: string;
  /** 상품명 (없으면 빈 문자열) */
  title: string;
  /** 대표 이미지 URL (없으면 null) */
  imageUrl: string | null;
  /**
   * 사이즈표: { 사이즈명: { 항목명: 숫자(cm) } }
   * ex) { 'M': { '어깨': 48, '가슴': 52, '총장': 70 } }
   * 못 찾으면 null
   */
  sizeTable: Record<string, Record<string, number>> | null;
};

export type ScrapeMessage =
  | { type: 'scrape:ok'; requestId: string; data: ScrapeProductData }
  | { type: 'scrape:fail'; requestId: string; reason: string }
  | { type: 'scrape:log'; message: string };

export function parseScrapeMessage(raw: string): ScrapeMessage | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.type === 'string' &&
      parsed.type.startsWith('scrape:')
    ) {
      return parsed as ScrapeMessage;
    }
  } catch {
    // not ours
  }
  return null;
}
