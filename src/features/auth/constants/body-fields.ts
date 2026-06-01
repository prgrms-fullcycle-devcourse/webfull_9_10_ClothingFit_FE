export type FieldKey = 'height' | 'weight' | 'chest' | 'waist' | 'hip' | 'shoulder';

export type BodyField = {
  key: FieldKey;
  label: string;
  placeholder: string;
  required?: boolean;
};

// 키/몸무게는 한 줄에 반반(row), 나머지 둘레는 세로로
export const ROW_FIELDS: BodyField[] = [
  { key: 'height', label: '키 (cm)', placeholder: '예: 170', required: true },
  { key: 'weight', label: '몸무게 (kg)', placeholder: '예: 65', required: true },
];

export const GIRTH_FIELDS: BodyField[] = [
  { key: 'chest', label: '가슴 둘레 (cm)', placeholder: '예: 90' },
  { key: 'waist', label: '허리 둘레 (cm)', placeholder: '예: 75' },
  { key: 'hip', label: '엉덩이 둘레 (cm)', placeholder: '예: 95' },
  { key: 'shoulder', label: '어깨 둘레 (cm)', placeholder: '예: 50' },
];

export const INITIAL_FORM: Record<FieldKey, string> = {
  height: '',
  weight: '',
  chest: '',
  waist: '',
  hip: '',
  shoulder: '',
};
