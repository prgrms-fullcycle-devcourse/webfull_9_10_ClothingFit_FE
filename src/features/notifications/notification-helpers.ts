import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import { NotificationType, type Notification } from './api';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * 알림 종류별 탭 시 이동 경로. 서버는 route를 주지 않으므로 type + 연관 객체로 분기한다.
 * 대상 객체(post/actor)가 없으면 undefined를 반환해 이동하지 않는다.
 */
export function notificationRoute(n: Notification): Href | undefined {
  switch (n.type) {
    case NotificationType.LIKE:
    case NotificationType.FEED_FROM_FOLLOWING:
      return n.post ? { pathname: '/post/[postId]', params: { postId: n.post.id } } : undefined;
    case NotificationType.FOLLOW:
      return n.actor ? { pathname: '/user/[userId]', params: { userId: n.actor.id } } : undefined;
    case NotificationType.FIT_2D_COMPLETE:
    case NotificationType.FIT_3D_COMPLETE:
      return '/(tabs)/profile/fitting-history';
    default:
      return undefined;
  }
}

/** 알림 종류별 아이콘 (Ionicons) */
export function notificationIcon(type: Notification['type']): IconName {
  switch (type) {
    case NotificationType.LIKE:
      return 'heart';
    case NotificationType.FOLLOW:
      return 'person-add';
    case NotificationType.FEED_FROM_FOLLOWING:
      return 'image';
    case NotificationType.FIT_2D_COMPLETE:
      return 'shirt';
    case NotificationType.FIT_3D_COMPLETE:
      return 'cube';
    default:
      return 'notifications';
  }
}

/** ISO 시각 문자열 → 상대 표기 (방금/N분 전/N시간 전/N일 전/M월 D일) */
export function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffMin = Math.floor((Date.now() - t) / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
