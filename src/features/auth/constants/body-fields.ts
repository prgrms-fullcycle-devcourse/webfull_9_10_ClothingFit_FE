import type { PatchProfileBodyBody } from '@/api/generated/schemas';

export type FieldKey =
  | 'height'
  | 'weight'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'shoulder'
  | 'head'
  | 'footSize';

export type BodyField = {
  key: FieldKey;
  label: string;
  placeholder: string;
  required?: boolean;
  /** 입력 검증 범위. 백엔드 검증(각 항목 최대 500)을 넘지 않도록 현실적 상한을 둔다. */
  min: number;
  max: number;
};

// 키/몸무게는 한 줄에 반반(row), 나머지는 세로로
export const ROW_FIELDS: BodyField[] = [
  { key: 'height', label: '키 (cm)', placeholder: '예: 170', required: true, min: 100, max: 250 },
  { key: 'weight', label: '몸무게 (kg)', placeholder: '예: 65', required: true, min: 20, max: 300 },
];

export const GIRTH_FIELDS: BodyField[] = [
  { key: 'chest', label: '가슴 둘레 (cm)', placeholder: '예: 90', min: 30, max: 200 },
  { key: 'waist', label: '허리 둘레 (cm)', placeholder: '예: 75', min: 30, max: 200 },
  { key: 'hip', label: '엉덩이 둘레 (cm)', placeholder: '예: 95', min: 30, max: 200 },
  { key: 'shoulder', label: '어깨 둘레 (cm)', placeholder: '예: 50', min: 20, max: 100 },
  { key: 'head', label: '머리 둘레 (cm)', placeholder: '예: 57', min: 30, max: 80 },
  { key: 'footSize', label: '발 크기 (mm)', placeholder: '예: 270', min: 150, max: 400 },
];

/** 모든 입력 필드(검증·순회용) */
export const ALL_FIELDS: BodyField[] = [...ROW_FIELDS, ...GIRTH_FIELDS];

export const INITIAL_FORM: Record<FieldKey, string> = {
  height: '',
  weight: '',
  chest: '',
  waist: '',
  hip: '',
  shoulder: '',
  head: '',
  footSize: '',
};

/**
 * 채워진 필드가 각자의 현실적 범위(백엔드 최대 500) 안인지 검증.
 * 위반 시 해당 필드 안내 메시지를, 모두 통과하면 null을 반환.
 */
export function validateBody(form: Record<FieldKey, string>): string | null {
  for (const f of ALL_FIELDS) {
    const raw = form[f.key].trim();
    if (raw === '') continue; // 선택 필드 미입력은 통과
    const n = Number(raw);
    if (Number.isNaN(n)) return `${f.label} 값이 올바르지 않아요.`;
    if (n < f.min || n > f.max) return `${f.label}는 ${f.min}~${f.max} 사이로 입력해 주세요.`;
  }
  return null;
}

/** 폼 문자열을 API 요청 본문으로 변환. 빈 선택 필드는 보내지 않음(undefined). */
export function formToBodyInput(form: Record<FieldKey, string>): PatchProfileBodyBody {
  const optional = (v: string) => (v.trim() === '' ? undefined : Number(v));
  return {
    height: Number(form.height),
    weight: Number(form.weight),
    chest: optional(form.chest),
    waist: optional(form.waist),
    hip: optional(form.hip),
    shoulder: optional(form.shoulder),
    head: optional(form.head),
    footSize: optional(form.footSize),
  };
}

/** BodyInfo 응답(숫자|null)을 폼 문자열로 변환. null/undefined는 빈칸. */
export function bodyInfoToForm(
  info: Partial<Record<FieldKey, number | null>>,
): Record<FieldKey, string> {
  const out = { ...INITIAL_FORM };
  for (const f of ALL_FIELDS) {
    const v = info[f.key];
    if (v != null) out[f.key] = String(v);
  }
  return out;
}
