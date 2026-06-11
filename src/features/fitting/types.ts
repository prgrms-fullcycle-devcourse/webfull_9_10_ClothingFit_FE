import type { SizeTable } from '@/features/webview/api/musinsa-size-api';
import type { CategoryId } from '@/features/webview/constants/categories';
import type { MeasurementSource, SizeTableSource } from '@/features/webview/types/copy-session';

/** 피팅 작업에 들어가는 옷 1벌 (COPY 슬롯의 스냅샷) */
export type FittingItem = {
  category: CategoryId;
  label: string;
  imageUri?: string;
  selectedSize?: string;
  measurements?: Record<string, number>;
  /** actual-size 실측 · 이미지 OCR · 기준표 seed 추정 */
  measurementSource?: MeasurementSource;
  /** 상품명 (브랜드 포함 원본) — 2D 생성 요청 meta용 */
  title?: string;
  /** 브랜드명 (분리됨) */
  brand?: string;
  /** 정제된 상품명 (분리됨) */
  productName?: string;
  /** 상품 페이지 URL */
  sourceUrl?: string;
  /** 전체 사이즈표 */
  sizeTable?: SizeTable;
  /** 사이즈표 출처 */
  sizeTableSource?: SizeTableSource;
};

export type FittingJobStatus = 'pending' | 'done' | 'failed';

export type FittingJob = {
  id: string;
  status: FittingJobStatus;
  createdAt: number;
  items: FittingItem[];
  /** 생성된 2D 아바타 이미지 (mock 단계에선 null일 수 있음) */
  resultImageUri?: string | null;
  /** 생성된 코디(옷장 아카이브) id — 이름변경 등에 사용 */
  archiveId?: string;
  /** 백엔드가 자동 생성한 코디 이름 */
  outfitName?: string;
  error?: string;
};
