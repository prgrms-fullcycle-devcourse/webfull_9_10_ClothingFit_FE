import type { Href } from 'expo-router';
import { useSyncExternalStore } from 'react';

export type BannerPayload = {
  id: string;
  title: string;
  message?: string;
  /** 탭 시 이동할 경로 */
  route?: Href;
};

let current: BannerPayload | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getBanner() {
  return current;
}

export function subscribeBanner(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showBanner(payload: Omit<BannerPayload, 'id'>) {
  current = { id: 'banner-' + Date.now().toString(36), ...payload };
  emit();
}

export function dismissBanner() {
  if (!current) return;
  current = null;
  emit();
}

export function useBanner() {
  return useSyncExternalStore(subscribeBanner, getBanner, getBanner);
}
