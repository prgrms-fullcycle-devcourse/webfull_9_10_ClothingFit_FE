import type { CategoryId } from '../constants/categories';
import type { MallId } from '../constants/malls';

export type CategorySlotStatus = 'empty' | 'done';

export type CategorySlot = {
  status: CategorySlotStatus;
  /** WebView에서 캡처한 의류 영역 이미지 (file:// or data:) */
  imageUri?: string;
  /** inject 스크래핑 결과 (사이즈표) — 없을 수도 있음 */
  measurements?: Record<string, number>;
  /** COPY 시점의 상품 페이지 URL */
  sourceUrl?: string;
};

export type CopySession = {
  mallId: MallId;
  /** 현재 COPY 대상 카테고리 (사이드바에서 선택) */
  activeCategory: CategoryId | null;
  /** 우측 off-canvas 사이드바 펼침/접힘 */
  sidebarVisible: boolean;
  /** Delete 모드: 슬롯 탭 시 삭제 */
  deleteMode: boolean;
  slots: Record<CategoryId, CategorySlot>;
};

export type SaveSlotPayload = {
  imageUri: string;
  measurements?: Record<string, number>;
  sourceUrl?: string;
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
    deleteMode: false,
    slots,
  };
}
