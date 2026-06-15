import { useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { fetch } from 'expo/fetch';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { refreshAccessToken } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth-storage';
import { env } from '@/lib/env';

import { NOTIFICATIONS_KEY, type Notification, type NotificationsPage } from './api';

/**
 * SSE로 받은 새 알림을 react-query 캐시 맨 앞에 직접 끼워넣는다(refetch 없음).
 * invalidate→refetch는 로딩 스피너가 한 번 도는데, prepend는 즉시 화면에 뜬다.
 * 캐시가 비어있거나(목록 화면을 아직 안 열었거나) payload 형태가 예상과 다르면
 * false를 반환 → 호출부에서 invalidate(따라잡기)로 폴백한다.
 */
function prependNotification(qc: QueryClient, raw: unknown): boolean {
  const noti = raw as Notification | null;
  if (!noti || typeof noti !== 'object' || !noti.id || typeof noti.message !== 'string') {
    return false;
  }

  let inserted = false;
  qc.setQueriesData<InfiniteData<NotificationsPage>>(
    { queryKey: [...NOTIFICATIONS_KEY, 'list'] },
    (old) => {
      if (!old || old.pages.length === 0) return old; // 캐시 없으면 건드리지 않음
      const [first, ...rest] = old.pages;
      if (first.data.some((d) => d.id === noti.id)) return old; // 중복 방지
      inserted = true;
      return {
        ...old,
        pages: [
          { ...first, data: [noti, ...first.data], unreadCount: (first.unreadCount ?? 0) + 1 },
          ...rest,
        ],
      };
    },
  );

  // 홈 헤더 뱃지용 안읽음 수 쿼리도 +1
  qc.setQueryData<NotificationsPage>([...NOTIFICATIONS_KEY, 'unread-count'], (old) =>
    old ? { ...old, unreadCount: (old.unreadCount ?? 0) + 1 } : old,
  );

  return inserted;
}

/**
 * 알림 SSE(text/event-stream) 구독 — expo/fetch 스트리밍 버전.
 * react-native-sse(XMLHttpRequest 기반)가 RN 신아키텍처에서 응답 스트림을
 * 제대로 못 받는 문제를 우회하기 위해, 네이티브 fetch의 ReadableStream을 직접 파싱한다.
 * @param enabled false면 구독하지 않음 (예: 화면 비활성)
 */
export function useNotificationsStream(enabled = true, onMessage?: (data: unknown) => void) {
  const qc = useQueryClient();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

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
          // 토큰 만료(401) → 갱신 후 즉시 재연결 (그냥 재시도하면 또 401)
          if (res.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken && !cancelled) {
              connect();
              return;
            }
          }
          // 403: 권한 문제 → 재시도해도 소용없음(로그인/토큰 갱신 시 재마운트로 재연결).
          if (res.status === 403) return;
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
        // (재)연결 시 알림을 다시 불러와 gap 동안 놓친 알림을 따라잡는다.
        qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });

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

          buffer += decoder.decode(value, { stream: true });

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

            let data: unknown;
            try {
              data = JSON.parse(payload);
            } catch {
              continue; // 파싱 불가한 조각은 무시
            }
            onMessageRef.current?.(data);

            // 새 알림을 캐시 맨 앞에 즉시 추가(로딩 스피너 없음).
            // 캐시가 없거나 형태가 다르면 invalidate로 따라잡는다.
            const inserted = prependNotification(qc, data);
            if (!inserted) {
              qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
            }
          }
        }

        // 정상 종료됐는데 아직 살아있으면 재연결
        if (!cancelled) scheduleRetry();
      } catch {
        if (cancelled || abort.signal.aborted) {
          return;
        }
        scheduleRetry();
      }
    };

    // 재연결 예약 (네트워크 끊김/서버 재시작 대비). delay 미지정 시 지수 백오프 사용.
    const scheduleRetry = (delay = retryDelay) => {
      if (cancelled) return;
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
    // authVersion을 의존성에서 뺀다: 다른 요청의 토큰 갱신마다 재연결되던 churn 방지.
    // (로그인/로그아웃은 탭 레이아웃의 mount/unmount로 처리됨)
  }, [enabled, qc]);
}
