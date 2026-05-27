import type { MallId } from '../constants/malls';

import { buildCm29ScrapeScript } from './cm29';
import { buildMusinsaScrapeScript } from './musinsa';

/** 몰별 inject 스크립트 dispatcher. zigzag는 아직 stub. */
export function buildScrapeScript(mallId: MallId, requestId: string): string {
  switch (mallId) {
    case 'musinsa':
      return buildMusinsaScrapeScript(requestId);
    case '29cm':
      return buildCm29ScrapeScript(requestId);
    case 'zigzag':
    default:
      return `
        (function() {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'scrape:fail',
              requestId: ${JSON.stringify(requestId)},
              reason: '지그재그는 아직 지원되지 않아요'
            }));
          } catch (e) {}
        })();
        true;
      `;
  }
}

export * from './protocol';
