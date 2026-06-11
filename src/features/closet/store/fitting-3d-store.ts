import { useSyncExternalStore } from 'react';

import { queryClient } from '@/lib/query-client';
import { showBanner } from '@/features/notifications/banner-store';
import {
  getGetClosetIdQueryKey,
  getGetClosetQueryKey,
} from '@/api/generated/endpoints/closet/closet';

import { get3DFittingStatus, save3DFittingModel, start3DFitting } from '../api/fitting-3d-api';

/** 폴링 주기(ms) */
const POLL_INTERVAL = 2500;

type Phase = 'starting' | 'queued' | 'processing' | 'saving' | 'succeeded' | 'failed';

export type Fitting3DJob = {
  archiveId: string;
  sessionId: string | null;
  phase: Phase;
  progress?: number;
  error?: string;
};

/**
 * 3D 생성 작업 스토어 (모듈 레벨).
 * 화면이 unmount 돼도 작업이 계속되고, 어느 화면에서나 진행 표시를 볼 수 있다.
 * 백엔드는 사용자당 동시 1건만 허용하므로 활성 작업도 1건만 둔다.
 */
let job: Fitting3DJob | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setJob(next: Fitting3DJob | null) {
  job = next;
  emit();
}

export function subscribe3D(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getJob3D() {
  return job;
}

const ACTIVE: Phase[] = ['starting', 'queued', 'processing', 'saving'];
const isActive = (j: Fitting3DJob | null) => !!j && ACTIVE.includes(j.phase);

/** 3D 생성 시작 (이미 진행 중이면 무시) */
export async function start3DJob(archiveId: string) {
  if (isActive(job)) return;
  setJob({ archiveId, sessionId: null, phase: 'starting', progress: 0 });
  try {
    const { sessionId } = await start3DFitting(archiveId);
    setJob({ archiveId, sessionId, phase: 'queued', progress: 0 });
    poll(sessionId, archiveId);
  } catch {
    setJob({ archiveId, sessionId: null, phase: 'failed', error: 'start' });
    showBanner({ title: '3D 생성 시작 실패', message: '잠시 후 다시 시도해 주세요' });
  }
}

/** 상태 폴링 (SUCCEEDED/FAILED까지) */
function poll(sessionId: string, archiveId: string) {
  setTimeout(async () => {
    // 작업이 교체/종료됐으면 중단
    if (!job || job.sessionId !== sessionId) return;
    try {
      const res = await get3DFittingStatus(sessionId);
      if (res.status === 'SUCCEEDED') {
        setJob({ archiveId, sessionId, phase: 'saving', progress: 100 });
        await save3DFittingModel(sessionId);
        queryClient.invalidateQueries({ queryKey: getGetClosetIdQueryKey(archiveId) });
        queryClient.invalidateQueries({ queryKey: getGetClosetQueryKey() });
        setJob({ archiveId, sessionId, phase: 'succeeded', progress: 100 });
        showBanner({ title: '3D 아바타 생성 완료', message: '옷장에서 확인하세요' });
      } else if (res.status === 'FAILED') {
        setJob({ archiveId, sessionId, phase: 'failed', error: 'mesh' });
        showBanner({ title: '3D 생성 실패', message: '잠시 후 다시 시도해 주세요' });
      } else {
        setJob({
          archiveId,
          sessionId,
          phase: res.status === 'QUEUED' ? 'queued' : 'processing',
          progress: res.progress ?? 0,
        });
        poll(sessionId, archiveId);
      }
    } catch {
      setJob({ archiveId, sessionId, phase: 'failed', error: 'poll' });
      showBanner({ title: '3D 생성 실패', message: '잠시 후 다시 시도해 주세요' });
    }
  }, POLL_INTERVAL);
}

/** 현재 활성(진행 중) 3D 작업 — 전역 표시용 */
export function useActive3DJob() {
  const j = useSyncExternalStore(subscribe3D, getJob3D, getJob3D);
  return isActive(j) ? j : null;
}

/** 특정 코디의 3D 작업 상태 (옷장 상세에서 사용) */
export function useFitting3D(archiveId: string) {
  const j = useSyncExternalStore(subscribe3D, getJob3D, getJob3D);
  const mine = j && j.archiveId === archiveId ? j : null;
  const phase = mine?.phase ?? null;

  return {
    start: () => start3DJob(archiveId),
    status:
      phase === 'queued'
        ? ('QUEUED' as const)
        : phase === 'processing' || phase === 'starting'
          ? ('PROCESSING' as const)
          : phase === 'succeeded'
            ? ('SUCCEEDED' as const)
            : phase === 'failed'
              ? ('FAILED' as const)
              : null,
    progress: mine?.progress ?? 0,
    isGenerating: isActive(mine),
    isSaving: phase === 'saving',
    isFailed: phase === 'failed',
  };
}
