import type { CategoryId } from '../constants/categories';
import type { MallId } from '../constants/malls';

export type CategorySlotStatus = 'empty' | 'done';

/** 구매 가능한 사이즈 옵션 1개 (라벨 + 품절 여부) */
export type SizeOption = {
  label: string;
  soldOut: boolean;
};

/** measurements / sizeTable 출처 */
export type MeasurementSource = 'actual' | 'image' | 'reference';

/** sizeTable 전체의 데이터 출처 (COPY 시점) */
export type SizeTableSource = 'actual' | 'html' | 'image' | 'reference';

export type CategorySlot = {
  status: CategorySlotStatus;
  /** WebView에서 캡처한 의류 영역 이미지 (file:// or data:) */
  imageUri?: string;
  /** 상품명 (스크래핑 제목 — 브랜드·쓰레기 포함 원본) */
  title?: string;
  /** 브랜드명 (meta product:brand — 깨끗함) */
  brand?: string;
  /** 정제된 상품명 (JSON-LD name — 브랜드/쓰레기 없음) */
  productName?: string;
  /** 선택한 사이즈의 측정값 (cm) */
  measurements?: Record<string, number>;
  /** measurements가 actual-size/HTML 실측인지, 기준표 seed 추정인지 */
  measurementSource?: MeasurementSource;
  /** 사용자가 고른 사이즈 라벨 (M, L 등) */
  selectedSize?: string;
  /** 구매 가능한 사이즈 옵션 (무신사 options API). confirm에서 선택용 */
  sizeOptions?: SizeOption[];
  /** 사이즈별 cm. actual-size · HTML · 기준표 seed */
  sizeTable?: Record<string, Record<string, number>>;
  /** sizeTable이 어디서 채워졌는지 */
  sizeTableSource?: SizeTableSource;
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
  title?: string;
  brand?: string;
  productName?: string;
  measurements?: Record<string, number>;
  measurementSource?: MeasurementSource;
  selectedSize?: string;
  sizeOptions?: SizeOption[];
  sizeTable?: Record<string, Record<string, number>>;
  sizeTableSource?: SizeTableSource;
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
    sidebarVisible: false,
    deleteMode: false,
    slots,
  };
}
