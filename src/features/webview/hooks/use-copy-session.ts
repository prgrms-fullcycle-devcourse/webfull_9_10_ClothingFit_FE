import { useCallback, useSyncExternalStore } from 'react';

import type { MallId } from '../constants/malls';
import type { CategoryId } from '../constants/categories';
import { createEmptyCopySession } from '../types/copy-session';
import {
  getCopySession,
  resetCopySessionStore,
  setCopySession,
  subscribeCopySession,
} from '../store/copy-session-store';

export function useCopySession(initialMallId?: MallId) {
  const session = useSyncExternalStore(subscribeCopySession, getCopySession, getCopySession);

  const selectCategory = useCallback((categoryId: CategoryId) => {
    setCopySession({
      ...getCopySession(),
      activeCategory: categoryId,
      sidebarVisible: false,
    });
  }, []);

  const markCategoryDone = useCallback((categoryId: CategoryId) => {
    const prev = getCopySession();
    setCopySession({
      ...prev,
      slots: {
        ...prev.slots,
        [categoryId]: {
          ...prev.slots[categoryId],
          status: 'done',
          measurements: { shoulder: 48, chest: 52 },
        },
      },
      sidebarVisible: true,
      activeCategory: null,
    });
  }, []);

  const clearCategory = useCallback((categoryId: CategoryId) => {
    const prev = getCopySession();
    setCopySession({
      ...prev,
      slots: { ...prev.slots, [categoryId]: { status: 'empty' } },
    });
  }, []);

  const resetSession = useCallback((mallId?: MallId) => {
    resetCopySessionStore(mallId ?? getCopySession().mallId);
  }, []);

  if (initialMallId && session.mallId !== initialMallId && session === getCopySession()) {
    // noop on first render mismatch — skeleton only
  }

  return {
    session,
    selectCategory,
    markCategoryDone,
    clearCategory,
    resetSession,
    setSession: setCopySession,
  };
}
