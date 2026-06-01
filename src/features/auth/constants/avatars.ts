import type { ImageSourcePropType } from 'react-native';

export type Gender = 'male' | 'female';

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

export type Avatar = { id: string; label: string; source: ImageSourcePropType };

// assets/images의 체형 이미지 (성별별 슬림/보통/통통)
// ※ female 파일명은 'famale-'로 저장돼 있음
export const AVATARS: Record<Gender, Avatar[]> = {
  male: [
    { id: 'male-slim', label: '슬림', source: require('../../../../assets/images/male-slim.png') },
    {
      id: 'male-average',
      label: '보통',
      source: require('../../../../assets/images/male-average.png'),
    },
    { id: 'male-fat', label: '통통', source: require('../../../../assets/images/male-fat.png') },
  ],
  female: [
    {
      id: 'female-slim',
      label: '슬림',
      source: require('../../../../assets/images/famale-slim.png'),
    },
    {
      id: 'female-average',
      label: '보통',
      source: require('../../../../assets/images/famale-average.png'),
    },
    {
      id: 'female-fat',
      label: '통통',
      source: require('../../../../assets/images/famale-fat.png'),
    },
  ],
};
