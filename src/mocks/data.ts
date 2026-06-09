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

export const MOCK_WORN_PRODUCTS = [
  { id: 'wp1', brand: '버니즈', name: '버니포켓버니즈팬츠', size: 'L' },
  { id: 'wp2', brand: '무신사 스탠다드', name: '오버핏 셔츠', size: 'M' },
];

export const MOCK_CLOSET_ARCHIVES = [
  {
    id: 'closet-1',
    title: '여름 코디',
    createdAt: '2026.04.30',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK9gJACNLV5RJ5RC8Me7u3GRvAQ-w8DHNqNw&s',
    modelUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Box/glTF-Binary/Box.glb',
    closetItems: [
      {
        id: 'item-1-1',
        name: '베이직 린넨 반팔 셔츠',
        brand: '무신사 스탠다드',
        imageUrl: null,
        type: 'TOP',
        size: 'M',
      },
    ],
  },
  {
    id: 'closet-2',
    title: '출근 룩',
    createdAt: '2026.04.28',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1694819488591-a43907d1c5cc?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9nJTIwYnJlZWRzfGVufDB8fDB8fHww',
    modelUrl: null,
    closetItems: [
      {
        id: 'item-2-1',
        name: 'VLAD 원턱 커브드 트랙 팬츠_립스탑',
        brand: '디미트리블랙',
        imageUrl:
          'https://image.msscdn.net/thumbnails/images/goods_img/20260325/6197079/6197079_17745797777550_big.jpg?w=1200',
        type: 'BOTTOM',
        size: '32',
      },
      {
        id: 'item-2-2',
        name: 'NBRJGS450R / FLAT BREEZE / SD2601RE',
        brand: '뉴발란스',
        imageUrl:
          'https://image.msscdn.net/thumbnails/images/goods_img/20260421/6347009/6347009_17767502675029_big.jpg?w=1200',
        type: 'SHOES',
        size: '270',
      },
    ],
  },
  {
    id: 'closet-3',
    title: '주말 캐주얼',
    createdAt: '2026.04.25',
    imageUrl:
      'https://media.istockphoto.com/id/475728270/photo/guinea-fun.jpg?s=612x612&w=0&k=20&c=EFLFP3gU2OSbfEotMxTHyuojTIkNKy52GpDIQB5bwyM=',
    modelUrl:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Box/glTF-Binary/Box.glb',
    closetItems: [
      {
        id: 'item-3-1',
        name: '슬림핏 옥스퍼드 셔츠 화이트',
        brand: '자라',
        imageUrl: null,
        type: 'TOP',
        size: 'M',
      },
      {
        id: 'item-3-2',
        name: '버니포켓 슬랙스 차콜',
        brand: '버니즈',
        imageUrl: null,
        type: 'BOTTOM',
        size: 'L',
      },
      {
        id: 'item-3-3',
        name: '더비 레더 슈즈 블랙',
        brand: '탄탄',
        imageUrl: null,
        type: 'SHOES',
        size: '270',
      },
      {
        id: 'item-3-4',
        name: '싱글 블레이저 네이비',
        brand: '코드그라피',
        imageUrl: null,
        type: 'OUTER',
        size: 'M',
      },
    ],
  },
];

export const MOCK_CLOSET_ITEMS = [
  // closet-1: 여름 코디
  {
    id: 'ci-1-1',
    closetArchiveId: 'closet-1',
    brand: '무신사 스탠다드',
    name: '베이직 린넨 반팔 셔츠',
    imageUrl: null,
    externalLink: null,
    type: 'top',
    size: 'M',
    createdAt: '2026.04.30',
  },
  {
    id: 'ci-1-2',
    closetArchiveId: 'closet-1',
    brand: '나이키',
    name: '드라이핏 카고 반바지',
    imageUrl: null,
    externalLink: null,
    type: 'bottom',
    size: '32',
    createdAt: '2026.04.30',
  },
  {
    id: 'ci-1-3',
    closetArchiveId: 'closet-1',
    brand: '뉴발란스',
    name: '327 스니커즈 화이트',
    imageUrl: null,
    externalLink: null,
    type: 'shoes',
    size: '270',
    createdAt: '2026.04.30',
  },
  {
    id: 'ci-1-4',
    closetArchiveId: 'closet-1',
    brand: '디스이즈네버댓',
    name: '버킷햇 블랙',
    imageUrl: null,
    externalLink: null,
    type: 'hat',
    size: 'FREE',
    createdAt: '2026.04.30',
  },
  // closet-2: 출근 룩
  {
    id: 'ci-2-1',
    closetArchiveId: 'closet-2',
    brand: '자라',
    name: '슬림핏 옥스퍼드 셔츠 화이트',
    imageUrl: null,
    externalLink: null,
    type: 'top',
    size: 'M',
    createdAt: '2026.04.28',
  },
  {
    id: 'ci-2-2',
    closetArchiveId: 'closet-2',
    brand: '버니즈',
    name: '버니포켓 슬랙스 차콜',
    imageUrl: null,
    externalLink: null,
    type: 'bottom',
    size: 'L',
    createdAt: '2026.04.28',
  },
  {
    id: 'ci-2-3',
    closetArchiveId: 'closet-2',
    brand: '탄탄',
    name: '더비 레더 슈즈 블랙',
    imageUrl: null,
    externalLink: null,
    type: 'shoes',
    size: '270',
    createdAt: '2026.04.28',
  },
  {
    id: 'ci-2-4',
    closetArchiveId: 'closet-2',
    brand: '코드그라피',
    name: '싱글 블레이저 네이비',
    imageUrl: null,
    externalLink: null,
    type: 'outer',
    size: 'M',
    createdAt: '2026.04.28',
  },
  // closet-3: 주말 캐주얼
  {
    id: 'ci-3-1',
    closetArchiveId: 'closet-3',
    brand: '커버낫',
    name: '베이직 피그먼트 티셔츠 베이지',
    imageUrl: null,
    externalLink: null,
    type: 'top',
    size: 'L',
    createdAt: '2026.04.25',
  },
  {
    id: 'ci-3-2',
    closetArchiveId: 'closet-3',
    brand: '리바이스',
    name: '501 오리지널 데님 인디고',
    imageUrl: null,
    externalLink: null,
    type: 'bottom',
    size: '32',
    createdAt: '2026.04.25',
  },
  {
    id: 'ci-3-3',
    closetArchiveId: 'closet-3',
    brand: '컨버스',
    name: '척테일러 올스타 하이 화이트',
    imageUrl: null,
    externalLink: null,
    type: 'shoes',
    size: '270',
    createdAt: '2026.04.25',
  },
  {
    id: 'ci-3-4',
    closetArchiveId: 'closet-3',
    brand: '아노에이',
    name: '오버핏 워싱 데님 재킷',
    imageUrl: null,
    externalLink: null,
    type: 'outer',
    size: 'L',
    createdAt: '2026.04.25',
  },
];

export const MOCK_FOLLOWERS = Array.from({ length: 5 }, (_, i) => ({
  id: `f-${i}`,
  nickname: 'Kian_OOTD',
  isFollowing: i % 2 === 0,
}));

export const MOCK_MEASUREMENTS = {
  top: { shoulder: 48, chest: 52, waist: 44 },
  bottom: { waist: 32, hip: 48, length: 102 },
};

export const MOCK_FITTING_ITEMS = [
  { id: 'fi1', brand: '버니즈', name: '버니포켓버니즈팬츠', category: 'bottom', size: 'L' },
  { id: 'fi2', brand: '무신사 스탠다드', name: '오버핏 셔츠', category: 'top', size: 'M' },
];

export const MOCK_OTHER_POSTS = [
  {
    id: 'op1',
    imageUrl:
      'https://img.magnific.com/free-photo/shot-lion-yawning_181624-24002.jpg?semt=ais_hybrid&w=740&q=80',
    likeCount: 0,
    isLiked: true,
  },
  {
    id: 'op2',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuD53e3eGmayjeMNwQWBeD54Na9cFIZkwGAw&s',
    likeCount: 2,
    isLiked: false,
  },
  {
    id: 'op3',
    imageUrl:
      'https://img.magnific.com/free-photo/shot-lion-yawning_181624-24002.jpg?semt=ais_hybrid&w=740&q=80',
    likeCount: 0,
    isLiked: true,
  },
  {
    id: 'op4',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuD53e3eGmayjeMNwQWBeD54Na9cFIZkwGAw&s',
    likeCount: 2,
    isLiked: false,
  },
];
