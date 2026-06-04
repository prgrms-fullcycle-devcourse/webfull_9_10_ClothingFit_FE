export const MOCK_USER = {
  id: 'u1',
  nickname: 'Kian_OOTD',
  height: 178,
  weight: 65,
  gender: '남',
  followers: 1200,
  following: 384,
  profileImage: null as string | null,
};

export const MOCK_POSTS = Array.from({ length: 12 }, (_, i) => ({
  id: `post-${i + 1}`,
  userId: 'u2',
  nickname: '@TEMP_ID',
  likes: [1200, 892, 3400, 256][i % 4],
  imageColor: ['#dbeafe', '#fef3c7', '#fce7f3', '#dcfce7'][i % 4],
  caption: `OOTD look #${i + 1}`,
  createdAt: '2024.05.21',
}));

export const MOCK_POPULAR_USERS = [
  { id: 'pu1', nickname: 'style_kian', followers: 2400 },
  { id: 'pu2', nickname: 'min_fit', followers: 1800 },
  { id: 'pu3', nickname: 'ootd_daily', followers: 920 },
];

export const MOCK_CLOSET_ITEMS = [
  {
    id: 'closet-1',
    name: '여름 코디',
    createdAt: '2026.04.30',
    is3d: true,
    color: '#93c5fd',
  },
  {
    id: 'closet-2',
    name: '출근 룩',
    createdAt: '2026.04.28',
    is3d: false,
    color: '#fcd34d',
  },
  {
    id: 'closet-3',
    name: '주말 캐주얼',
    createdAt: '2026.04.25',
    is3d: true,
    color: '#86efac',
  },
];

export const MOCK_WORN_PRODUCTS = [
  { id: 'wp1', brand: '버니즈', name: '버니포켓버니즈팬츠', size: 'L' },
  { id: 'wp2', brand: '무신사 스탠다드', name: '오버핏 셔츠', size: 'M' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: '3d', title: '3D 모델 생성이 완료되었습니다.', time: '방금', read: false },
  {
    id: 'n2',
    type: 'follow',
    title: '민지님이 회원님을 팔로우합니다.',
    time: '1시간 전',
    read: false,
  },
  { id: 'n3', type: 'like', title: '내 게시물에 좋아요를 눌렀습니다.', time: '2일 전', read: true },
  {
    id: 'n4',
    type: 'avatar',
    title: 'AI 아바타 생성이 완료되었습니다.',
    time: '3주 전',
    read: true,
  },
];

export const MOCK_FOLLOWERS = Array.from({ length: 5 }, (_, i) => ({
  id: `f-${i}`,
  nickname: 'Kian_OOTD',
  isFollowing: i % 2 === 0,
}));
