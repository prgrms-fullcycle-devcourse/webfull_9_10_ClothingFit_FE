export type MallId = 'musinsa' | '29cm' | 'zigzag';

export type Mall = {
  id: MallId;
  label: string;
  /** 아이콘 칸용 짧은 텍스트 (실제 로고 이미지 들어오기 전 placeholder) */
  shortLabel: string;
  homeUrl: string;
  /** 모바일 사이트가 따로 있으면 우선 사용 */
  mobileHomeUrl?: string;
};

export const MALLS: Mall[] = [
  {
    id: 'musinsa',
    label: '무신사',
    shortLabel: 'MU',
    homeUrl: 'https://www.musinsa.com',
    mobileHomeUrl: 'https://m.musinsa.com',
  },
  {
    id: '29cm',
    label: '29CM',
    shortLabel: '29',
    homeUrl: 'https://www.29cm.co.kr',
  },
  {
    id: 'zigzag',
    label: '지그재그',
    shortLabel: 'Z',
    homeUrl: 'https://zigzag.kr',
  },
];

export function getMall(id: MallId): Mall {
  return MALLS.find((m) => m.id === id) ?? MALLS[0];
}
