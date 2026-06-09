export type MallId = 'musinsa';

export type Mall = {
  id: MallId;
  label: string;
  /** 아이콘 칸용 짧은 텍스트 (실제 로고 이미지 들어오기 전 placeholder) */
  shortLabel: string;
  homeUrl: string;
  /** 모바일 사이트가 따로 있으면 우선 사용 */
  mobileHomeUrl?: string;
};

// 현재 타깃은 무신사 단일 몰. (29CM/지그재그는 추후 재도입 가능)
export const MALLS: Mall[] = [
  {
    id: 'musinsa',
    label: '무신사',
    shortLabel: 'MU',
    homeUrl: 'https://www.musinsa.com',
    /** m.musinsa.com — WebView에서 403 등 차단 빈번 → www 우선 */
    mobileHomeUrl: 'https://www.musinsa.com',
  },
];

export function getMall(id: MallId): Mall {
  return MALLS.find((m) => m.id === id) ?? MALLS[0];
}

/** inject 스크래핑 지원 몰 */
export function isScrapeSupported(mallId: MallId): boolean {
  return mallId === 'musinsa';
}
