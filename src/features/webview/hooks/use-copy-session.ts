import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { CategoryId } from '../constants/categories';
import type { MallId } from '../constants/malls';
import {
  getCopySession,
  resetCopySessionStore,
  setCopySession,
  subscribeCopySession,
} from '../store/copy-session-store';
import type { MeasurementSource, SaveSlotPayload } from '../types/copy-session';
import { resolveSlotMeasurements } from '../utils/resolve-slot-measurements';

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
          title: payload.title,
          brand: payload.brand,
          productName: payload.productName,
          measurements: payload.measurements,
          measurementSource: payload.measurementSource,
          selectedSize: payload.selectedSize,
          sizeOptions: payload.sizeOptions,
          sizeTable: payload.sizeTable,
          sizeTableSource: payload.sizeTableSource,
          sourceUrl: payload.sourceUrl,
        },
      },
      activeCategory: null,
      deleteMode: false,
    });
  }, []);

  // confirm 화면에서 사이즈만 변경
  const setSlotSize = useCallback(
    (
      categoryId: CategoryId,
      sizeName: string,
      measurements?: Record<string, number>,
      measurementSource?: MeasurementSource,
    ) => {
      const prev = getCopySession();
      const slot = prev.slots[categoryId];
      if (slot.status !== 'done') return;

      let resolvedMeasurements = measurements;
      let resolvedSource = measurementSource;

      if (!resolvedMeasurements) {
        const resolved = resolveSlotMeasurements(
          categoryId,
          sizeName,
          slot.sizeTable,
          slot.sizeTableSource,
        );
        resolvedMeasurements = resolved.measurements;
        resolvedSource = resolved.source;
      }

      setCopySession({
        ...prev,
        slots: {
          ...prev.slots,
          [categoryId]: {
            ...slot,
            selectedSize: sizeName,
            measurements: resolvedMeasurements,
            measurementSource: resolvedSource,
          },
        },
      });
    },
    [],
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
    // 몰만 변경 — 이미 캡처한 슬롯은 유지
    setCopySession({
      ...prev,
      mallId,
      activeCategory: null,
      deleteMode: false,
    });
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
    setSlotSize,
    clearCategory,
    toggleDeleteMode,
    changeMall,
    resetSession,
    setSession: setCopySession,
  };
}
