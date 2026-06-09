import type { Href } from 'expo-router';
import { useSyncExternalStore } from 'react';

import { MOCK_NOTIFICATIONS } from '@/mocks/data';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  time: string;
  read: boolean;
  /** 탭 시 이동할 경로 (없으면 이동 안 함) */
  route?: Href;
};

let items: AppNotification[] = MOCK_NOTIFICATIONS.map((n) => ({ ...n }));
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getNotifications() {
  return items;
}

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addNotification(notification: Omit<AppNotification, 'id'>) {
  const id = 'noti-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  items = [{ id, ...notification }, ...items];
  emit();
}

export function markNotificationRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  emit();
}

export function useNotifications() {
  return useSyncExternalStore(subscribeNotifications, getNotifications, getNotifications);
}
