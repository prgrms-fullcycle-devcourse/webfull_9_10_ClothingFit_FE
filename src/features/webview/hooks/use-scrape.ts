import { useCallback, useRef } from 'react';

import type { MallId } from '../constants/malls';
import { buildScrapeScript } from '../inject';
import { parseScrapeMessage, type ScrapeProductData } from '../inject/protocol';

type PendingResolver = {
  resolve: (data: ScrapeProductData) => void;
  reject: (err: Error) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
};

type StartOptions = {
  mallId: MallId;
  /** WebView ref의 injectJavaScript를 호출하는 콜백 */
  inject: (script: string) => void;
  /** ms */
  timeoutMs?: number;
};

/**
 * COPY 트리거 시 호출 → Promise 반환.
 * WebView onMessage에서 도착하는 메시지를 requestId로 매칭해 resolve.
 *
 * 사용 패턴:
 *   const { startScrape, handleWebViewMessage } = useScrape();
 *   <ShopWebView onScrapeMessage={handleWebViewMessage} />
 *   const data = await startScrape({ mallId, inject: ref.current.injectJavaScript });
 */
export function useScrape() {
  const pendingRef = useRef<Map<string, PendingResolver>>(new Map());

  const startScrape = useCallback(
    ({ mallId, inject, timeoutMs = 6000 }: StartOptions): Promise<ScrapeProductData> => {
      const requestId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      const script = buildScrapeScript(mallId, requestId);

      return new Promise<ScrapeProductData>((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          const entry = pendingRef.current.get(requestId);
          if (!entry) return;
          pendingRef.current.delete(requestId);
          reject(new Error('스크래핑 타임아웃'));
        }, timeoutMs);

        pendingRef.current.set(requestId, { resolve, reject, timeoutHandle });

        try {
          inject(script);
        } catch (e) {
          clearTimeout(timeoutHandle);
          pendingRef.current.delete(requestId);
          reject(e instanceof Error ? e : new Error('inject 실패'));
        }
      });
    },
    [],
  );

  const handleWebViewMessage = useCallback((raw: string) => {
    const msg = parseScrapeMessage(raw);
    if (!msg) return;
    if (msg.type === 'scrape:log') {
      if (__DEV__) console.log('[inject]', msg.message);
      return;
    }
    const entry = pendingRef.current.get(msg.requestId);
    if (!entry) return;
    clearTimeout(entry.timeoutHandle);
    pendingRef.current.delete(msg.requestId);
    if (msg.type === 'scrape:ok') entry.resolve(msg.data);
    else entry.reject(new Error(msg.reason));
  }, []);

  return { startScrape, handleWebViewMessage };
}
