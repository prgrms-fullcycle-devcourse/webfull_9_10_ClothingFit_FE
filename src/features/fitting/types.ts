import type { CategoryId } from '@/features/webview/constants/categories';
import type { MeasurementSource } from '@/features/webview/types/copy-session';

/** 피팅 작업에 들어가는 옷 1벌 (COPY 슬롯의 스냅샷) */
export type FittingItem = {
  category: CategoryId;
  label: string;
  imageUri?: string;
  selectedSize?: string;
  measurements?: Record<string, number>;
  /** actual-size 실측 · 이미지 OCR · 기준표 seed 추정 */
  measurementSource?: MeasurementSource;
};

export type FittingJobStatus = 'pending' | 'done' | 'failed';

export type FittingJob = {
  id: string;
  status: FittingJobStatus;
  createdAt: number;
  items: FittingItem[];
  /** 생성된 2D 아바타 이미지 (mock 단계에선 null일 수 있음) */
  resultImageUri?: string | null;
  error?: string;
};
