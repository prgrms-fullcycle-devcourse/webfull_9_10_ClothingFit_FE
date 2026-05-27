import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { CategoryId } from '../constants/categories';
import type { MallId } from '../constants/malls';
import {
  getCopySession,
  resetCopySessionStore,
  setCopySession,
  subscribeCopySession,
} from '../store/copy-session-store';
import type { SaveSlotPayload } from '../types/copy-session';

export function useCopySession(_initialMallId?: MallId) {
  const session = useSyncExternalStore(subscribeCopySession, getCopySession, getCopySession);

  // ── 사이드바 / 카테고리 선택 ─────────────────────────────
  const selectCategory = useCallback((categoryId: CategoryId) => {
    const prev = getCopySession();
    setCopySession({
      ...prev,
      activeCategory: categoryId,
    });
  }, []);

  const clearActiveCategory = useCallback(() => {
    const prev = getCopySession();
    setCopySession({ ...prev, activeCategory: null });
  }, []);

  const toggleSidebar = useCallback(() => {
    const prev = getCopySession();
    setCopySession({ ...prev, sidebarVisible: !prev.sidebarVisible });
  }, []);

  const setSidebarVisible = useCallback((visible: boolean) => {
    const prev = getCopySession();
    if (prev.sidebarVisible === visible) return;
    setCopySession({ ...prev, sidebarVisible: visible });
  }, []);

  // ── 슬롯 저장 / 삭제 ────────────────────────────────────
  const saveSlot = useCallback((categoryId: CategoryId, payload: SaveSlotPayload) => {
    const prev = getCopySession();
    setCopySession({
      ...prev,
      slots: {
        ...prev.slots,
        [categoryId]: {
          status: 'done',
          imageUri: payload.imageUri,
          measurements: payload.measurements,
          sourceUrl: payload.sourceUrl,
        },
      },
      activeCategory: null,
    });
  }, []);

  /** Mock 용 — 실제 inject 결과 들어오기 전 임시 */
  const markCategoryDone = useCallback(
    (categoryId: CategoryId) => {
      saveSlot(categoryId, {
        imageUri: 'https://placehold.co/120x160/png',
        measurements: { shoulder: 48, chest: 52 },
      });
    },
    [saveSlot],
  );

  const clearCategory = useCallback((categoryId: CategoryId) => {
    const prev = getCopySession();
    setCopySession({
      ...prev,
      slots: { ...prev.slots, [categoryId]: { status: 'empty' } },
    });
  }, []);

  // ── Delete 모드 ─────────────────────────────────────────
  const toggleDeleteMode = useCallback(() => {
    const prev = getCopySession();
    setCopySession({ ...prev, deleteMode: !prev.deleteMode });
  }, []);

  // ── 몰 변경 / 세션 리셋 ─────────────────────────────────
  const changeMall = useCallback((mallId: MallId) => {
    const prev = getCopySession();
    if (prev.mallId === mallId) return;
    // 몰만 바꾸고 슬롯은 유지할지 정책 필요. 우선 슬롯도 리셋(요구사항 모호).
    resetCopySessionStore(mallId);
  }, []);

  const resetSession = useCallback((mallId?: MallId) => {
    resetCopySessionStore(mallId ?? getCopySession().mallId);
  }, []);

  // ── 파생 상태 ───────────────────────────────────────────
  const filledCount = useMemo(
    () =>
      (Object.values(session.slots) as { status: string }[]).filter((s) => s.status === 'done')
        .length,
    [session.slots],
  );

  return {
    session,
    filledCount,
    canGenerate: filledCount >= 1,
    selectCategory,
    clearActiveCategory,
    toggleSidebar,
    setSidebarVisible,
    saveSlot,
    markCategoryDone, // mock (Phase 2에서 inject 결과로 대체)
    clearCategory,
    toggleDeleteMode,
    changeMall,
    resetSession,
    setSession: setCopySession,
  };
}
