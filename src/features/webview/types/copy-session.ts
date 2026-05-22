import type { CategoryId } from '../constants/categories';
import type { MallId } from '../constants/malls';

export type CategorySlotStatus = 'empty' | 'done';

export type CategorySlot = {
  status: CategorySlotStatus;
  imageUri?: string;
  measurements?: Record<string, number>;
  sourceUrl?: string;
};

export type CopySession = {
  mallId: MallId;
  activeCategory: CategoryId | null;
  sidebarVisible: boolean;
  slots: Record<CategoryId, CategorySlot>;
};

export function createEmptyCopySession(mallId: MallId): CopySession {
  const slots = {} as Record<CategoryId, CategorySlot>;
  const categories: CategoryId[] = ['hat', 'outer', 'top', 'bottom', 'shoes'];
  for (const id of categories) {
    slots[id] = { status: 'empty' };
  }
  return {
    mallId,
    activeCategory: null,
    sidebarVisible: true,
    slots,
  };
}
