import type { CategoryId } from '../constants/categories';
import type { SizeTable } from '../api/musinsa-size-api';

/** 텍스트에서 숫자 추출 + mm면 cm로 변환 */
export function parseMeasurementText(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const isMm = /mm/i.test(trimmed);
  const num = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num)) return null;
  return isMm ? num / 10 : num;
}

/** 단일 측정값을 cm로 정규화 (카테고리·항목명 휴리스틱) */
export function normalizeMeasurementCm(
  name: string,
  value: number,
  categoryId: CategoryId,
): number {
  if (categoryId === 'shoes') {
    // 신발: 100~350 숫자는 한국 mm로 간주 (250 → 25cm)
    if (value >= 100 && value <= 350) {
      return Math.round((value / 10) * 10) / 10;
    }
    return value;
  }

  // 의류: 200cm 넘는 총장 등은 mm 오입력 가능
  const garmentMmLikely = /총장|어깨|가슴|소매|허리|엉덩|허벅|밑위|밑단|머리|깊이|챙/.test(name);
  if (garmentMmLikely && value >= 200 && value <= 2000) {
    return Math.round((value / 10) * 10) / 10;
  }
  return value;
}

/** sizeTable 전체를 cm 기준으로 정규화 */
export function normalizeSizeTable(table: SizeTable, categoryId: CategoryId): SizeTable {
  const out: SizeTable = {};
  for (const [sizeName, row] of Object.entries(table)) {
    const normalized: Record<string, number> = {};
    for (const [name, value] of Object.entries(row)) {
      normalized[name] = normalizeMeasurementCm(name, value, categoryId);
    }
    out[sizeName] = normalized;
  }
  return out;
}
