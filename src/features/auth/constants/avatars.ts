import type { ImageSourcePropType } from 'react-native';

import type { CharacterListItemBodyType, CharacterListItemGender } from '@/api/generated/schemas';

export type Gender = 'male' | 'female';

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

/** 프론트 성별 → 백엔드 enum (캐릭터 목록 그룹 키) */
export const toApiGender: Record<Gender, CharacterListItemGender> = {
  male: 'MALE',
  female: 'FEMALE',
};

/** 백엔드 bodyType → 한글 라벨 (백엔드는 라벨을 주지 않음) */
export const BODY_TYPE_LABEL: Record<CharacterListItemBodyType, string> = {
  SLIM: '슬림',
  NORMAL: '보통',
  OVERWEIGHT: '통통',
  OBESE: '비만',
};

// 캐릭터 imageUrl 로딩 전/실패 시 placeholder로 쓸 로컬 체형 이미지.
// ※ female 파일명은 'famale-'로 저장돼 있음. OBESE는 전용 에셋이 없어 통통 이미지를 재사용.
const FALLBACK: Record<Gender, Record<CharacterListItemBodyType, ImageSourcePropType>> = {
  male: {
    SLIM: require('../../../../assets/images/male-slim.png'),
    NORMAL: require('../../../../assets/images/male-average.png'),
    OVERWEIGHT: require('../../../../assets/images/male-fat.png'),
    OBESE: require('../../../../assets/images/male-fat.png'),
  },
  female: {
    SLIM: require('../../../../assets/images/famale-slim.png'),
    NORMAL: require('../../../../assets/images/famale-average.png'),
    OVERWEIGHT: require('../../../../assets/images/famale-fat.png'),
    OBESE: require('../../../../assets/images/famale-fat.png'),
  },
};

export function fallbackImage(gender: Gender, bodyType: CharacterListItemBodyType) {
  return FALLBACK[gender][bodyType];
}
