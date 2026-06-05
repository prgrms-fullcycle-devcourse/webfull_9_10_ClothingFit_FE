/**
 * 무신사 「기준표 사이즈」 seed (앱 내장).
 * actual-size API가 null일 때 사이즈 라벨 → 추정 cm 매핑에 사용.
 *
 * 출처: 무신사 상품 상세 > 사이즈 > 기준표 사이즈 (국제 변환표)
 * - 의류: 한국 가슴 기준(cm) — 2D 피팅용 참고치
 * - 신발: 한국 mm → 발길이(cm)
 */

export type ReferenceSizeEntry = {
  /** 매칭할 라벨 (대소문자 무시, trim) */
  labels: string[];
  measurements: Record<string, number>;
};

/**
 * 상의/아웃터용: XS~XXL + 한국 숫자(85~110) + 여성 44~88. 가슴 기준(cm).
 * 아디다스 등 "아시아 사이즈 알파"(A/XS, A/M…)도 대응하는 일반 사이즈에 alias로 매핑.
 */
export const CLOTHING_ALPHA_REF: ReferenceSizeEntry[] = [
  { labels: ['XXS', 'A/2XS'], measurements: { '가슴(기준)': 80 } },
  { labels: ['XS', '44', 'A/XS'], measurements: { '가슴(기준)': 85 } },
  { labels: ['S', '55', '90', 'A/S'], measurements: { '가슴(기준)': 90 } },
  { labels: ['M', '66', '95', 'A/M'], measurements: { '가슴(기준)': 95 } },
  { labels: ['L', '77', '100', 'A/L'], measurements: { '가슴(기준)': 100 } },
  { labels: ['XL', '88', '105', 'A/XL'], measurements: { '가슴(기준)': 105 } },
  { labels: ['XXL', '2XL', '110', 'A/2XL'], measurements: { '가슴(기준)': 110 } },
  { labels: ['3XL', 'A/3XL'], measurements: { '가슴(기준)': 115 } },
  { labels: ['4XL', 'A/4XL'], measurements: { '가슴(기준)': 120 } },
];

/**
 * 하의용: 허리 기준(cm). 상의와 달리 하의는 허리둘레가 핵심이라 별도 표를 둔다.
 * 아시아 사이즈 알파(A/XS…)도 alias로 매핑.
 */
export const BOTTOM_ALPHA_REF: ReferenceSizeEntry[] = [
  { labels: ['XXS', '24', 'A/2XS'], measurements: { '허리(기준)': 62 } },
  { labels: ['XS', '25', '26', '44', 'A/XS'], measurements: { '허리(기준)': 66 } },
  { labels: ['S', '27', '28', '55', 'A/S'], measurements: { '허리(기준)': 71 } },
  { labels: ['M', '29', '30', '66', 'A/M'], measurements: { '허리(기준)': 76 } },
  { labels: ['L', '31', '32', '77', 'A/L'], measurements: { '허리(기준)': 82 } },
  { labels: ['XL', '33', '34', '88', 'A/XL'], measurements: { '허리(기준)': 88 } },
  { labels: ['XXL', '2XL', '36', 'A/2XL'], measurements: { '허리(기준)': 94 } },
  { labels: ['3XL', '38', 'A/3XL'], measurements: { '허리(기준)': 100 } },
  { labels: ['4XL', '40', 'A/4XL'], measurements: { '허리(기준)': 106 } },
];

/** 한국 mm + 주요 US/EU/UK/JP alias → 발길이(cm) */
export const SHOES_MM_REF: ReferenceSizeEntry[] = [
  { labels: ['220', '22', '220mm'], measurements: { 발길이: 22.0 } },
  { labels: ['225', '22.5', '225mm'], measurements: { 발길이: 22.5 } },
  { labels: ['230', '23', '230mm'], measurements: { 발길이: 23.0 } },
  { labels: ['235', '23.5', '235mm'], measurements: { 발길이: 23.5 } },
  { labels: ['240', '24', '240mm', 'EU38', 'EU 38'], measurements: { 발길이: 24.0 } },
  { labels: ['245', '24.5', '245mm'], measurements: { 발길이: 24.5 } },
  {
    labels: ['250', '25', '250mm', 'US7', 'US 7', 'US7M', 'US 7M', 'UK6', 'UK 6', 'EU39', 'EU 39'],
    measurements: { 발길이: 25.0 },
  },
  { labels: ['255', '25.5', '255mm', 'US7.5', 'US 7.5', 'US7.5M'], measurements: { 발길이: 25.5 } },
  {
    labels: ['260', '26', '260mm', 'US8', 'US 8', 'US8M', 'UK7', 'UK 7', 'EU40', 'EU 40'],
    measurements: { 발길이: 26.0 },
  },
  { labels: ['265', '26.5', '265mm', 'US8.5', 'US 8.5'], measurements: { 발길이: 26.5 } },
  {
    labels: ['270', '27', '270mm', 'US9', 'US 9', 'US9M', 'UK8', 'UK 8'],
    measurements: { 발길이: 27.0 },
  },
  { labels: ['275', '27.5', '275mm', 'US9.5', 'US 9.5'], measurements: { 발길이: 27.5 } },
  {
    labels: ['280', '28', '280mm', 'US10', 'US 10', 'US10M', 'UK9', 'UK 9', 'EU44', 'EU 44'],
    measurements: { 발길이: 28.0 },
  },
  // 아동·유아 (mm 그대로 → cm)
  { labels: ['140', '140mm', '14'], measurements: { 발길이: 14.0 } },
  { labels: ['145', '145mm', '14.5'], measurements: { 발길이: 14.5 } },
  { labels: ['150', '150mm', '15'], measurements: { 발길이: 15.0 } },
  { labels: ['160', '160mm', '16'], measurements: { 발길이: 16.0 } },
  { labels: ['170', '170mm', '17'], measurements: { 발길이: 17.0 } },
  { labels: ['180', '180mm', '18'], measurements: { 발길이: 18.0 } },
  { labels: ['190', '190mm', '19'], measurements: { 발길이: 19.0 } },
  { labels: ['200', '200mm', '20'], measurements: { 발길이: 20.0 } },
  { labels: ['210', '210mm', '21'], measurements: { 발길이: 21.0 } },
];

/** 모자 — 기준표 탭 없음. FREE/단일 사이즈용 대략치 */
export const HAT_REF: ReferenceSizeEntry[] = [
  {
    labels: ['FREE', 'F', 'ONE', 'ONESIZE', 'OS', '단일', 'NONE'],
    measurements: { '머리둘레(기준)': 58 },
  },
  { labels: ['S', '56'], measurements: { '머리둘레(기준)': 56 } },
  { labels: ['M', '58'], measurements: { '머리둘레(기준)': 58 } },
  { labels: ['L', '60'], measurements: { '머리둘레(기준)': 60 } },
];
