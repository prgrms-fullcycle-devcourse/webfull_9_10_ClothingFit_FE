import type { SizeOption } from '../types/copy-session';

/**
 * 무신사 상품 사이즈 API (options + actual-size).
 *
 * - options: 구매 가능한 사이즈 라벨 목록
 * - actual-size: 사이즈별 실측(cm). data가 null이면 실측 미등록(기준표만 있는 상품)
 * - 로그인/쿠키 불필요(공개). RN fetch는 브라우저 CORS 제약을 받지 않음.
 */

export type SizeTable = Record<string, Record<string, number>>;

const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

function optionsEndpoint(goodsNo: string): string {
  return `https://goods-detail.musinsa.com/api2/goods/${goodsNo}/options?goodsSaleType=SALE`;
}

function actualSizeEndpoint(goodsNo: string): string {
  return `https://goods-detail.musinsa.com/api2/goods/${goodsNo}/actual-size`;
}

/** 무신사 상품 URL에서 상품번호 추출. (예: .../products/5180173) */
export function extractMusinsaGoodsNo(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/products\/(\d+)/);
  return m ? m[1] : null;
}

/** 옵션 API 응답(JSON)을 사이즈 옵션 배열로 정규화. */
export function parseSizeOptions(json: unknown): SizeOption[] {
  const data = (json as { data?: unknown })?.data as
    | { basic?: unknown; optionItems?: unknown }
    | undefined;
  const basic = Array.isArray(data?.basic) ? (data!.basic as Record<string, unknown>[]) : [];

  // 사이즈 그룹 찾기:
  //  1) 그룹명이 "사이즈/size"면 그걸로
  //  2) 없으면 색상 그룹(색상/컬러/color/C)이 아닌 첫 옵션 그룹을 사이즈로 본다.
  //     (아이더 등 일부 브랜드는 사이즈 그룹명을 "S"처럼 단순 코드로 준다)
  const groupName = (b: Record<string, unknown>) =>
    typeof b?.name === 'string' ? (b.name as string) : '';
  const isColorGroup = (b: Record<string, unknown>) =>
    /색상|컬러|color/i.test(groupName(b)) || groupName(b).trim().toUpperCase() === 'C';

  let group = basic.find((b) => /사이즈|size/i.test(groupName(b)));
  if (!group) {
    group = basic.find(
      (b) =>
        !isColorGroup(b) &&
        Array.isArray(b?.optionValues) &&
        (b.optionValues as unknown[]).length > 0,
    );
  }
  const optionValues = Array.isArray(group?.optionValues)
    ? (group!.optionValues as Record<string, unknown>[])
    : [];
  if (optionValues.length === 0) return [];

  // optionValueNo -> 재고 있는 optionItem이 하나라도 있나?
  const items = Array.isArray(data?.optionItems)
    ? (data!.optionItems as Record<string, unknown>[])
    : [];
  const stockByValueNo = new Map<number, boolean>();
  for (const it of items) {
    const nos = Array.isArray(it?.optionValueNos) ? (it.optionValueNos as number[]) : [];
    const activated = Boolean(it?.activated);
    for (const no of nos) {
      stockByValueNo.set(no, (stockByValueNo.get(no) ?? false) || activated);
    }
  }

  const sorted = [...optionValues].sort(
    (a, b) => Number(a?.sequence ?? 0) - Number(b?.sequence ?? 0),
  );

  const seen = new Set<string>();
  const out: SizeOption[] = [];
  for (const v of sorted) {
    const label = String(v?.name ?? '').trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const no = Number(v?.no);
    const inStock = stockByValueNo.has(no) ? stockByValueNo.get(no)! : true;
    out.push({ label, soldOut: !inStock });
  }
  return out;
}

/** actual-size API 응답(JSON)을 sizeTable로 정규화. data가 null이면 null. */
export function parseActualSize(json: unknown): SizeTable | null {
  const data = (json as { data?: unknown | null })?.data;
  if (!data || typeof data !== 'object') return null;

  const sizes = (data as { sizes?: unknown }).sizes;
  if (!Array.isArray(sizes) || sizes.length === 0) return null;

  const table: SizeTable = {};
  for (const size of sizes) {
    const name = String((size as { name?: unknown })?.name ?? '').trim();
    if (!name) continue;
    const items = Array.isArray((size as { items?: unknown }).items)
      ? (size as { items: unknown[] }).items
      : [];
    const measurements: Record<string, number> = {};
    for (const item of items) {
      const itemName = String((item as { name?: unknown })?.name ?? '').trim();
      const value = Number((item as { value?: unknown })?.value);
      // value가 0이면 "항목만 등록, 수치 미입력"인 빈 껍데기 → 제외
      // (무신사가 실측 항목명만 넣고 값은 0으로 둔 상품이 있음)
      if (itemName && Number.isFinite(value) && value > 0) {
        measurements[itemName] = value;
      }
    }
    if (Object.keys(measurements).length > 0) {
      table[name] = measurements;
    }
  }
  return Object.keys(table).length > 0 ? table : null;
}

/** 타임아웃이 있는 GET fetch — 응답이 안 오면 abort해서 무한 대기를 막는다. */
async function fetchJsonWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': MOBILE_UA },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** 상품번호로 사이즈 옵션을 fetch. */
export async function fetchMusinsaSizeOptions(goodsNo: string): Promise<SizeOption[]> {
  const res = await fetchJsonWithTimeout(optionsEndpoint(goodsNo));
  if (!res.ok) throw new Error(`사이즈 옵션 조회 실패 (${res.status})`);
  const json = (await res.json()) as unknown;
  return parseSizeOptions(json);
}

/** 상품번호로 실측 사이즈표를 fetch. 실측 미등록이면 null. */
export async function fetchMusinsaActualSize(goodsNo: string): Promise<SizeTable | null> {
  const res = await fetchJsonWithTimeout(actualSizeEndpoint(goodsNo));
  if (!res.ok) throw new Error(`실측 사이즈 조회 실패 (${res.status})`);
  const json = (await res.json()) as unknown;
  return parseActualSize(json);
}
