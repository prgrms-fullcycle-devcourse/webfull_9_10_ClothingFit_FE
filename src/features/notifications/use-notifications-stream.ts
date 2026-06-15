import { useQueryClient } from '@tanstack/react-query';
import { fetch } from 'expo/fetch';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { getAuthVersion, subscribeAuthChange } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth-storage';
import { env } from '@/lib/env';

import { NOTIFICATIONS_KEY } from './api';

/**
 * 알림 SSE(text/event-stream) 구독 — expo/fetch 스트리밍 버전.
 * react-native-sse(XMLHttpRequest 기반)가 RN 신아키텍처에서 응답 스트림을
 * 제대로 못 받는 문제를 우회하기 위해, 네이티브 fetch의 ReadableStream을 직접 파싱한다.
 * @param enabled false면 구독하지 않음 (예: 화면 비활성)
 */
export function useNotificationsStream(enabled = true, onMessage?: (data: unknown) => void) {
  const qc = useQueryClient();
  // authVersion 변경 시 재연결
  const authVersion = useSyncExternalStore(subscribeAuthChange, getAuthVersion);

  useEffect(() => {
    if (!enabled || !env.apiUrl || Platform.OS === 'web') {
      return;
    }

    const abort = new AbortController();
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    // 재연결 지수 백오프: 5초 → 최대 60초. 연결 성공 시 5초로 리셋.
    const BASE_DELAY = 5000;
    const MAX_DELAY = 60_000;
    let retryDelay = BASE_DELAY;

    const connect = async () => {
      const token = await getAccessToken();
      if (cancelled || !token) {
        return;
      }

      const base = env.apiUrl.replace(/\/$/, '');
      const url = `${base}/notifications/stream`;

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
            'Accept-Encoding': 'identity',
          },
          signal: abort.signal,
        });

        if (!res.ok || !res.body) {
          // 401/403: 토큰 문제 → 재시도해도 소용없음(로그인/토큰 갱신 시 authVersion이 바뀌며 재연결).
          if (res.status === 401 || res.status === 403) return;
          // 429: 서버 레이트리밋 → Retry-After를 존중하고, 없으면 최소 30초 이상 길게 백오프.
          if (res.status === 429) {
            const retryAfter = Number(res.headers.get('retry-after'));
            scheduleRetry(
              Number.isFinite(retryAfter) && retryAfter > 0
                ? retryAfter * 1000
                : Math.max(retryDelay, 30_000),
            );
            return;
          }
          scheduleRetry();
          return;
        }

        // 연결 성공 → 백오프 리셋
        retryDelay = BASE_DELAY;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 완성된 이벤트(빈 줄로 구분)들을 분리, 마지막 미완성 조각은 버퍼에 남김
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const evt of events) {
            // data: 로 시작하는 줄만 추출
            const dataLines = evt
              .split('\n')
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trimStart());

            if (dataLines.length === 0) continue; // : connected, : ping 같은 코멘트 무시

            const payload = dataLines.join('\n');

            try {
              const data = JSON.parse(payload);
              onMessage?.(data);
            } catch (err) {
              console.log('[SSE] 파싱 실패, raw:', payload, err);
            }
            // 새 알림 → 목록/카운트 갱신
            qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
          }
        }

        // 정상 종료됐는데 아직 살아있으면 재연결
        if (!cancelled) scheduleRetry();
      } catch (e) {
        if (cancelled || abort.signal.aborted) {
          console.log('[SSE] close 🔌 (의도적 종료)');
          return;
        }
        console.log('[SSE] error ❌', e);
        scheduleRetry();
      }
    };

    // 재연결 예약 (네트워크 끊김/서버 재시작 대비). delay 미지정 시 지수 백오프 사용.
    const scheduleRetry = (delay = retryDelay) => {
      if (cancelled) return;
      console.log(`[SSE] ${Math.round(delay / 1000)}초 후 재연결 예약`);
      retryTimer = setTimeout(connect, delay);
      // 다음 재시도는 더 길게(최대 MAX_DELAY) — 서버를 계속 두드려 429를 악화시키지 않도록.
      retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      abort.abort(); // 진행 중인 fetch/스트림 중단
    };
  }, [enabled, qc, authVersion]);
}
