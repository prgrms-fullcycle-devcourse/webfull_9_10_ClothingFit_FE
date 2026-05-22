import type { CategoryId } from './categories';

/** 카테고리별 스크래핑·표시 필드 — BE 스펙 확정 시 동기화 */
export const CATEGORY_FIELDS: Record<CategoryId, string[]> = {
  hat: [],
  outer: [],
  top: ['shoulder', 'chest', 'waist'],
  bottom: ['waist', 'hip', 'length'],
  shoes: [],
};
