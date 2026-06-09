/**
 * notifications feature API.
 * Orval 생성 훅을 도메인 이름으로 감싸고, 커서 기반 무한 목록과 뮤테이션 후 무효화를 더한다.
 */
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import {
  getGetNotificationsSettingsQueryKey,
  getNotifications,
  useDeleteNotifications,
  useDeleteNotificationsId,
  usePatchNotificationsReadAll,
  usePatchNotificationsSettings,
} from '@/api/generated/endpoints/notification/notification';
import type { GetNotificationsResponse } from '@/api/generated/schemas';

export { GetNotificationsResponseDataItemType as NotificationType } from '@/api/generated/schemas';
export type {
  GetNotificationsResponse as NotificationsPage,
  GetNotificationsResponseDataItem as Notification,
  NotificationSettingsResponse,
} from '@/api/generated/schemas';

/** 알림 목록/카운트 무효화 기준 prefix 키 (목록·SSE·뮤테이션 공용) */
export const NOTIFICATIONS_KEY = ['notifications'] as const;

/** 알림 목록 — 커서 기반 무한 스크롤. 첫 페이지의 unreadCount가 전체 안읽음 수. */
export function useNotifications(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list', limit],
    queryFn: ({ pageParam }) =>
      getNotifications({ cursor: pageParam as string | undefined, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: GetNotificationsResponse) =>
      last.hasMore ? (last.nextCursor ?? undefined) : undefined,
  });
}

/**
 * 안읽은 알림 수 (홈 헤더 뱃지용). 목록과 같은 prefix 키라 읽음/삭제 뮤테이션 후 함께 갱신된다.
 * 미로그인/에러 시 데이터 없음 → 호출부에서 0으로 처리.
 */
export function useUnreadNotificationCount() {
  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => getNotifications({ limit: 1 }),
    select: (res) => res.unreadCount,
  });
  // 화면에 들어올 때마다(탭 전환·복귀) 최신 안읽음 수를 다시 받아온다.
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  return query;
}

/** 전체 알림 읽음 (개별 읽음 API는 백엔드에 없음) */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return usePatchNotificationsReadAll({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }) },
  });
}

/** 알림 개별 삭제 */
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useDeleteNotificationsId({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }) },
  });
}

/** 알림 전체 삭제 */
export function useClearNotifications() {
  const qc = useQueryClient();
  return useDeleteNotifications({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }) },
  });
}

/** 알림 설정(전체 on/off) 조회 */
export { useGetNotificationsSettings as useNotificationSettings } from '@/api/generated/endpoints/notification/notification';

/** 알림 설정 변경 */
export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return usePatchNotificationsSettings({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsSettingsQueryKey() }),
    },
  });
}
