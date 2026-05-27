/**
 * 폰트 명명 규칙
 * - Latin 글리프: NotoSans
 * - 한글 글리프: NotoSansKR (한국어가 메인이므로 기본 폰트로 사용)
 *
 * RN에서 두 폰트를 한 fontFamily로 묶을 수 없어서, Text 컴포넌트는
 * 한글이 잘 그려지는 NotoSansKR를 우선 사용한다. 영문 전용 자리에
 * 디자인이 다르면 NotoSans로 교체.
 */
export const fonts = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
  // 라틴 전용으로 살짝 다르게 보이고 싶을 때
  latinRegular: 'NotoSans_400Regular',
  latinMedium: 'NotoSans_500Medium',
  latinBold: 'NotoSans_700Bold',
} as const;
