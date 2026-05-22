import type { MallId } from '../constants/malls';

/** 쇼핑몰별 inject 스크립트 — musinsa.ts, cm29.ts 등 추가 예정 */
export function getScrapeInjectScript(_mallId: MallId): string {
  return `
    (function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scrape', data: {} }));
    })();
    true;
  `;
}
