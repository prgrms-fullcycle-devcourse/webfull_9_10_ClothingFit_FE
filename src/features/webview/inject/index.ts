import type { MallId } from '../constants/malls';

import { buildMusinsaScrapeScript } from './musinsa';

/** 몰별 inject 스크립트 dispatcher. 현재 타깃은 무신사 단일 몰. */
export function buildScrapeScript(_mallId: MallId, requestId: string): string {
  return buildMusinsaScrapeScript(requestId);
}

export * from './protocol';
