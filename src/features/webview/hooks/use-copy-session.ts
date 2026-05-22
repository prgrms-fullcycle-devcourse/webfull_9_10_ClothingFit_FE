import { useCallback, useState } from 'react';

import type { MallId } from '../constants/malls';
import type { CategoryId } from '../constants/categories';
import { createEmptyCopySession, type CopySession } from '../types/copy-session';

/** ④ 카테고리·체크·삭제 · ⑥ SAVE/Cancel 세션 상태 (API 연동은 추후) */
export function useCopySession(initialMallId: MallId = '29cm') {
  const [session, setSession] = useState<CopySession>(() => createEmptyCopySession(initialMallId));

  const selectCategory = useCallback((categoryId: CategoryId) => {
    setSession((prev) => ({
      ...prev,
      activeCategory: categoryId,
      sidebarVisible: false,
    }));
  }, []);

  const markCategoryDone = useCallback((categoryId: CategoryId) => {
    setSession((prev) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [categoryId]: { ...prev.slots[categoryId], status: 'done' },
      },
      sidebarVisible: true,
      activeCategory: null,
    }));
  }, []);

  const clearCategory = useCallback((categoryId: CategoryId) => {
    setSession((prev) => ({
      ...prev,
      slots: {
        ...prev.slots,
        [categoryId]: { status: 'empty' },
      },
    }));
  }, []);

  const resetSession = useCallback((mallId?: MallId) => {
    setSession(createEmptyCopySession(mallId ?? session.mallId));
  }, [session.mallId]);

  return {
    session,
    selectCategory,
    markCategoryDone,
    clearCategory,
    resetSession,
    setSession,
  };
}
