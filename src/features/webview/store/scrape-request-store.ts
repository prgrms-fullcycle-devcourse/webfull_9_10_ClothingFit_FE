import type { MallId } from '../constants/malls';
import { buildScrapeScript } from '../inject';
import { parseScrapeMessage, type ScrapeProductData } from '../inject/protocol';

type PendingResolver = {
  resolve: (data: ScrapeProductData) => void;
  reject: (err: Error) => void;
  timeoutHandle: ReturnType<typeof setTimeout>;
};

type StartScrapeOptions = {
  mallId: MallId;
  inject: (script: string) => void;
  timeoutMs?: number;
};

/** 화면 unmount와 무관하게 scrape 요청을 매칭 (모듈 레벨) */
const pending = new Map<string, PendingResolver>();

/**
 * 결과가 await보다 "먼저" 도착한 경우를 위한 보관함.
 * WebView가 crop 화면 이동 후 throttle되면 inject가 늦게 끝나기도 하고,
 * 반대로 await 등록 전에 결과가 올 수도 있어 양방향 레이스를 모두 흡수한다.
 */
const earlyResults = new Map<
  string,
  { ok: true; data: ScrapeProductData } | { ok: false; reason: string }
>();

export function startScrape({
  mallId,
  inject,
  timeoutMs = 6000,
}: StartScrapeOptions): Promise<ScrapeProductData> {
  const requestId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const script = buildScrapeScript(mallId, requestId);

  return new Promise<ScrapeProductData>((resolve, reject) => {
    // 이미 결과가 먼저 와 있으면 즉시 처리
    const early = earlyResults.get(requestId);
    if (early) {
      earlyResults.delete(requestId);
      if (early.ok) return resolve(early.data);
      return reject(new Error(early.reason));
    }

    const timeoutHandle = setTimeout(() => {
      const entry = pending.get(requestId);
      if (!entry) return;
      pending.delete(requestId);
      if (__DEV__) console.log('[startScrape] 타임아웃 reject requestId=', requestId);
      reject(new Error('스크래핑 타임아웃'));
    }, timeoutMs);

    pending.set(requestId, { resolve, reject, timeoutHandle });

    try {
      inject(script);
    } catch (e) {
      clearTimeout(timeoutHandle);
      pending.delete(requestId);
      reject(e instanceof Error ? e : new Error('inject 실패'));
    }
  });
}

export function handleScrapeWebViewMessage(raw: string) {
  const msg = parseScrapeMessage(raw);
  if (!msg) return;
  if (msg.type === 'scrape:log') {
    if (__DEV__) console.log('[inject]', msg.message);
    return;
  }
  if (__DEV__) {
    if (msg.type === 'scrape:ok') {
      console.log('[scrape:ok] 결과 수신', JSON.stringify(msg.data, null, 2));
    } else {
      console.log('[scrape:fail]', msg.reason);
    }
  }

  const entry = pending.get(msg.requestId);
  if (!entry) {
    // await가 아직 없거나 타임아웃으로 사라짐 → 결과를 잠시 보관해두면
    // 늦게 await가 붙어도(또는 재시도해도) 받을 수 있다. 60초 후 폐기.
    if (msg.type === 'scrape:ok') {
      earlyResults.set(msg.requestId, { ok: true, data: msg.data });
    } else {
      earlyResults.set(msg.requestId, { ok: false, reason: msg.reason });
    }
    setTimeout(() => earlyResults.delete(msg.requestId), 60000);
    return;
  }

  clearTimeout(entry.timeoutHandle);
  pending.delete(msg.requestId);
  if (msg.type === 'scrape:ok') entry.resolve(msg.data);
  else entry.reject(new Error(msg.reason));
}
