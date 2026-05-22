export type CategoryId = 'hat' | 'outer' | 'top' | 'bottom' | 'shoes';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'hat', label: '모자' },
  { id: 'outer', label: '아웃터' },
  { id: 'top', label: '상의' },
  { id: 'bottom', label: '하의' },
  { id: 'shoes', label: '신발' },
];
