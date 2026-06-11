/**
 * 몸무게 변화에 따른 둘레(가슴/허리/엉덩이) 자동 보정.
 *
 * 정확한 공식은 없고 평균적 추정이다. 성별에 따라 살이 붙는 부위 경향이 달라
 * (남=배/허리, 여=엉덩이/허벅지) 계수를 다르게 둔다. 어디까지나 추정값이며,
 * 사용자는 상세 체형 수정에서 직접 덮어쓸 수 있다.
 */
export type Sex = 'MALE' | 'FEMALE';

export type Circumferences = {
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
};

/** 몸무게 +1kg당 둘레 증가량(cm) */
const COEF: Record<Sex, { chest: number; waist: number; hip: number }> = {
  MALE: { chest: 0.6, waist: 1.0, hip: 0.4 },
  FEMALE: { chest: 0.5, waist: 0.6, hip: 0.8 },
};

/** 입력 gender 문자열을 Sex로 정규화 (기본 MALE) */
export function toSex(gender?: string | null): Sex {
  return gender === 'FEMALE' ? 'FEMALE' : 'MALE';
}

/**
 * 기존 둘레를 몸무게 변화량만큼 보정한다.
 * - 값이 없는(null) 둘레는 보정하지 않고 undefined로 둔다 (없는 값을 지어내지 않음).
 * - 백엔드가 정수 cm만 받으므로 정수로 반올림, 최소 20cm로 클램프(비정상 음수/과소 방지).
 */
export function adjustCircumferences(
  prev: Circumferences,
  weightDelta: number,
  gender?: string | null,
): Circumferences {
  const c = COEF[toSex(gender)];
  const adj = (v: number | null | undefined, per: number) =>
    v == null ? undefined : Math.max(20, Math.round(v + weightDelta * per));
  return {
    chest: adj(prev.chest, c.chest),
    waist: adj(prev.waist, c.waist),
    hip: adj(prev.hip, c.hip),
  };
}
