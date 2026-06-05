import type { CategoryId } from '../constants/categories';
import {
  BOTTOM_ALPHA_REF,
  CLOTHING_ALPHA_REF,
  HAT_REF,
  SHOES_MM_REF,
  type ReferenceSizeEntry,
} from '../data/musinsa-standard-sizes';
import type { SizeTable } from '../api/musinsa-size-api';
import type { MeasurementSource, SizeOption, SizeTableSource } from '../types/copy-session';

export type ResolvedMeasurements = {
  measurements?: Record<string, number>;
  source?: MeasurementSource;
  /** 기준표 seed가 사용됐는지 (UI "기준표 추정" 표기용) */
  usedReference?: boolean;
};

/** 카테고리별 2D 핏에 필요한 핵심 측정항목 (부분 문자열로 매칭) */
const PRIMARY_MEASUREMENT: Partial<Record<CategoryId, string>> = {
  hat: '머리둘레',
  shoes: '발길이',
  top: '가슴',
  outer: '가슴',
  bottom: '허리',
};

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, '').toUpperCase();
}

/** 표 row에 카테고리 핵심 측정항목이 들어있는지 (예: 모자 → "머리둘레") */
function hasPrimaryMeasurement(categoryId: CategoryId, row: Record<string, number>): boolean {
  const key = PRIMARY_MEASUREMENT[categoryId];
  if (!key) return true;
  return Object.keys(row).some((name) => name.includes(key));
}

function chartForCategory(categoryId: CategoryId): ReferenceSizeEntry[] {
  switch (categoryId) {
    case 'shoes':
      return SHOES_MM_REF;
    case 'hat':
      return HAT_REF;
    case 'bottom':
      return BOTTOM_ALPHA_REF; // 하의는 허리 기준
    case 'top':
    case 'outer':
      return CLOTHING_ALPHA_REF; // 상의/아웃터는 가슴 기준
    default:
      return CLOTHING_ALPHA_REF;
  }
}

function lookupInChart(
  chart: ReferenceSizeEntry[],
  sizeLabel: string,
  categoryId: CategoryId,
): Record<string, number> | null {
  const key = normalizeLabel(sizeLabel);
  if (!key) return null;

  // 1) 시드 표에 라벨이 직접 있으면 그 측정값 사용 (가장 정확)
  for (const entry of chart) {
    for (const alias of entry.labels) {
      if (normalizeLabel(alias) === key) {
        return { ...entry.measurements };
      }
    }
  }

  // ── 이하 폴백: 시드에 라벨이 없을 때 숫자에서 추정 ──
  // ★ 카테고리별로 측정항목명이 다르므로 categoryId 기준으로 분기한다.

  // 신발: mm 라벨 처리 (괄호 "05(250)" / 범위 "225-230" / 순수 mm)
  if (categoryId === 'shoes') {
    const parenMatch = sizeLabel.match(/\((\d{3})\)/); // "05(250)"
    if (parenMatch) {
      const mm = parseFloat(parenMatch[1]);
      if (mm >= 180 && mm <= 360) return { 발길이: Math.round((mm / 10) * 10) / 10 };
    }
    const rangeMatch = sizeLabel.match(/(\d{3})\s*[-~]\s*(\d{3})/); // "225-230"
    if (rangeMatch) {
      const a = parseFloat(rangeMatch[1]);
      const b = parseFloat(rangeMatch[2]);
      if (a >= 180 && b <= 360) return { 발길이: Math.round(((a + b) / 2 / 10) * 10) / 10 };
    }
    const mm = parseFloat(sizeLabel.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(mm) && mm >= 100 && mm <= 350) {
      return { 발길이: Math.round((mm / 10) * 10) / 10 };
    }
    return null;
  }

  // 의류/모자: 숫자 라벨 → 카테고리에 맞는 측정항목으로 추정
  const num = parseFloat(sizeLabel.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num)) return null;

  if (categoryId === 'hat') {
    // 모자: 머리둘레 범위(54~62)면 그대로 사용
    if (num >= 50 && num <= 64) return { '머리둘레(기준)': num };
    return null;
  }

  if (categoryId === 'bottom') {
    // 하의: 허리 추정. 인치(24~46)면 cm로 환산, cm(60~120)면 그대로
    if (num >= 22 && num <= 46) return { '허리(기준)': Math.round(num * 2.54) };
    if (num >= 60 && num <= 120) return { '허리(기준)': num };
    return null;
  }

  // 상의/아웃터: 한국 가슴 기준(85~115, 5단위)
  if (num >= 85 && num <= 120 && num % 5 === 0) {
    return { '가슴(기준)': num };
  }
  return null;
}

/** sizeTable 키와 라벨 fuzzy 매칭 (대소문자·공백 무시) */
export function findSizeTableEntry(
  sizeTable: SizeTable | undefined,
  sizeLabel: string,
): Record<string, number> | undefined {
  if (!sizeTable) return undefined;
  if (sizeTable[sizeLabel]) return sizeTable[sizeLabel];

  const key = normalizeLabel(sizeLabel);
  for (const [name, row] of Object.entries(sizeTable)) {
    if (normalizeLabel(name) === key) return row;
  }
  return undefined;
}

function formatMeasurementsForLog(measurements: Record<string, number>): string {
  return Object.entries(measurements)
    .map(([name, value]) => `${name} ${value}cm`)
    .join(', ');
}

function logReferenceResolved(
  categoryId: CategoryId,
  sizeLabel: string,
  measurements: Record<string, number>,
): void {
  if (!__DEV__) return;
  console.log(
    `[size:reference] ${categoryId} · ${sizeLabel} → ${formatMeasurementsForLog(measurements)} (musinsa-standard-sizes)`,
  );
}

/** options API 라벨 목록 전체에 대해 기준표 seed sizeTable 생성 */
export function buildReferenceSizeTable(
  categoryId: CategoryId,
  sizeOptions: SizeOption[],
): SizeTable | undefined {
  const table: SizeTable = {};
  for (const opt of sizeOptions) {
    const row = lookupInChart(chartForCategory(categoryId), opt.label, categoryId);
    if (row) table[opt.label] = row;
  }
  return Object.keys(table).length > 0 ? table : undefined;
}

/** COPY 완료 시 dev 로그 — sizeTable 전체 (XS~4XL 등) */
export function logCopySizeData(params: {
  title?: string;
  categoryId: CategoryId;
  sizeTableSource?: SizeTableSource;
  sizeTable?: SizeTable;
  sizeOptionLabels?: string[];
}): void {
  if (!__DEV__) return;
  const payload = {
    title: params.title,
    category: params.categoryId,
    sizeTableSource: params.sizeTableSource ?? null,
    sizeTable: params.sizeTable ?? null,
    sizeOptions: params.sizeOptionLabels ?? [],
  };
  if (params.sizeTableSource === 'reference') {
    console.log(
      `[copy:size-data] 기준표 seed에서 sizeTable 생성 (musinsa-standard-sizes)\n${JSON.stringify(payload, null, 2)}`,
    );
  } else {
    console.log(`[copy:size-data]\n${JSON.stringify(payload, null, 2)}`);
  }
}

/** 로깅 없이 sizeTable → measurements 해석 (UI 미리보기/내부 공용) */
function resolveCore(
  categoryId: CategoryId,
  sizeLabel: string,
  sizeTable?: SizeTable,
  sizeTableSource?: SizeTableSource,
): ResolvedMeasurements {
  const fromTable = findSizeTableEntry(sizeTable, sizeLabel);
  if (fromTable && Object.keys(fromTable).length > 0) {
    let source: MeasurementSource;
    if (sizeTableSource === 'reference') source = 'reference';
    else if (sizeTableSource === 'image') source = 'image';
    else source = 'actual'; // actual / html (실측·실측에 준함)

    // 사이즈는 표에 있지만 핵심 측정항목(머리둘레/발길이/가슴/허리)이 빠진 경우
    // → 기준표 seed로 보완 (예: 모자 표에 챙길이만 있고 머리둘레 누락)
    if (!hasPrimaryMeasurement(categoryId, fromTable)) {
      const ref = lookupInChart(chartForCategory(categoryId), sizeLabel, categoryId);
      if (ref) {
        return {
          measurements: { ...fromTable, ...ref },
          source: 'reference',
          usedReference: true,
        };
      }
    }
    return { measurements: fromTable, source, usedReference: source === 'reference' };
  }

  // 사이즈 자체가 표에 없음 (예: OCR 표에 4XL 누락) → 기준표 seed 폴백
  const reference = lookupInChart(chartForCategory(categoryId), sizeLabel, categoryId);
  if (reference) {
    return { measurements: reference, source: 'reference', usedReference: true };
  }

  return {};
}

/** sizeTable → 선택 사이즈 measurements 해석 (등록 시: dev 로그 포함) */
export function resolveSlotMeasurements(
  categoryId: CategoryId,
  sizeLabel: string,
  sizeTable?: SizeTable,
  sizeTableSource?: SizeTableSource,
): ResolvedMeasurements {
  const resolved = resolveCore(categoryId, sizeLabel, sizeTable, sizeTableSource);
  if (resolved.usedReference && resolved.measurements) {
    logReferenceResolved(categoryId, sizeLabel, resolved.measurements);
  }
  return resolved;
}

/** UI 미리보기용 — 로그 없이 measurements + 기준표 추정 여부만 반환 */
export function resolveMeasurementsForDisplay(
  categoryId: CategoryId,
  sizeLabel: string,
  sizeTable?: SizeTable,
  sizeTableSource?: SizeTableSource,
): ResolvedMeasurements {
  return resolveCore(categoryId, sizeLabel, sizeTable, sizeTableSource);
}

export function lookupReferenceMeasurements(
  categoryId: CategoryId,
  sizeLabel: string,
): Record<string, number> | null {
  return lookupInChart(chartForCategory(categoryId), sizeLabel, categoryId);
}
