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
          scheduleRetry();
          return;
        }

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

    // 5초 뒤 재연결 (네트워크 끊김/서버 재시작 대비)
    const scheduleRetry = () => {
      if (cancelled) return;
      console.log('[SSE] 5초 후 재연결 예약');
      retryTimer = setTimeout(connect, 5000);
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      abort.abort(); // 진행 중인 fetch/스트림 중단
    };
  }, [enabled, qc, authVersion]);
}
