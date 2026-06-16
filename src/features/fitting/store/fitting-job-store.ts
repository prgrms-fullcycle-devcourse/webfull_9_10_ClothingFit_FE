import { useSyncExternalStore } from 'react';

import { showBanner } from '@/features/notifications/banner-store';
import { resetCopySessionStore } from '@/features/webview/store/copy-session-store';

import { generateFitting } from '../api/fitting-api';
import type { FittingItem, FittingJob } from '../types';

/**
 * 피팅 작업 스토어 (모듈 레벨).
 * 화면이 unmount 돼도 작업은 계속 진행되고, 완료 시 상단 배너 + 알림을 띄운다.
 * (= 비동기 백그라운드 생성)
 */
let jobs: Record<string, FittingJob> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setJob(job: FittingJob) {
  jobs = { ...jobs, [job.id]: job };
  emit();
}

export function getJobs() {
  return jobs;
}

export function getJob(id?: string) {
  return id ? jobs[id] : undefined;
}

export function getLatestDoneJob() {
  return Object.values(jobs)
    .filter((j) => j.status === 'done')
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

export function subscribeJobs(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startFittingJob(items: FittingItem[]): string {
  const id = 'fit-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  setJob({ id, status: 'pending', createdAt: Date.now(), items });

  generateFitting(items)
    .then((res) => {
      const prev = jobs[id];
      if (!prev) return;
      setJob({
        ...prev,
        status: 'done',
        resultImageUri: res.imageUri,
        archiveId: res.archiveId,
        outfitName: res.outfitName,
      });
      // 피팅 완료 → 넣었던 옷(copy-session 슬롯) 캐시를 비워 다음 생성을 새로 시작하게 한다.
      resetCopySessionStore();
      const route = { pathname: '/(tabs)/fitting/result', params: { jobId: id } } as const;
      // 알림은 서버(SSE/알림 목록)가 단일 소스. 로컬 2D 피팅 완료는 즉시성 위해 배너만 띄운다.
      showBanner({
        title: '2D 아바타 생성 완료',
        message: '탭하여 결과를 확인하세요',
        route,
      });
    })
    .catch((err) => {
      const prev = jobs[id];
      if (!prev) return;
      // generateFitting이 사유별 친화 메시지를 던짐 → 배너에 그대로 노출
      const reason = err instanceof Error && err.message ? err.message : '다시 시도해주세요';
      setJob({ ...prev, status: 'failed', error: reason });
      showBanner({ title: '2D 아바타 생성 실패', message: reason });
    });

  return id;
}

export function useFittingJob(id?: string) {
  const snapshot = useSyncExternalStore(subscribeJobs, getJobs, getJobs);
  return id ? snapshot[id] : undefined;
}

export function useLatestDoneJob() {
  useSyncExternalStore(subscribeJobs, getJobs, getJobs);
  return getLatestDoneJob();
}
