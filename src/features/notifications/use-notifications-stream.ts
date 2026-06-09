import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import EventSource from 'react-native-sse';

import { getAuthVersion, subscribeAuthChange } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth-storage';
import { env } from '@/lib/env';

import { NOTIFICATIONS_KEY } from './api';

/**
 * 알림 SSE(text/event-stream) 구독.
 * 새 이벤트가 오면 알림 목록 쿼리를 무효화해 갱신한다(개별 병합 대신 invalidate — 단순·정확).
 * Authorization 헤더가 필요하므로 SecureStore의 access token을 실어 연결한다.
 * @param enabled false면 구독하지 않음 (예: 화면 비활성)
 */
export function useNotificationsStream(enabled = true) {
  const qc = useQueryClient();
  // 로그인/로그아웃 시 토큰이 바뀌므로, authVersion이 바뀌면 effect를 다시 실행해 재연결한다.
  const authVersion = useSyncExternalStore(subscribeAuthChange, getAuthVersion);

  useEffect(() => {
    // SecureStore·react-native-sse는 네이티브 전용 → 웹에서는 SSE 구독을 건너뛴다.
    if (!enabled || !env.apiUrl || Platform.OS === 'web') return;

    let es: EventSource | null = null;
    let cancelled = false;

    (async () => {
      const token = await getAccessToken();
      if (cancelled || !token) return;

      const base = env.apiUrl.replace(/\/$/, '');
      es = new EventSource(`${base}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        // 기본 폴링 재연결 사용. 네트워크 끊김 시 라이브러리가 재연결을 시도한다.
      });

      // 새 알림 수신 → 목록/카운트 갱신
      es.addEventListener('message', () => {
        qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      });
    })();

    return () => {
      cancelled = true;
      es?.removeAllEventListeners();
      es?.close();
    };
  }, [enabled, qc, authVersion]);
}
