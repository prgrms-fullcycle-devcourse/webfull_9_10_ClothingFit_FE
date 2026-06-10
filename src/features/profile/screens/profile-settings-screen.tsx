import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { useDeleteAccount } from '@/features/auth/hooks/use-delete-account';
import { useLogout } from '@/features/auth/hooks/use-logout';

const sections = [
  {
    title: '내 정보',
    items: ['닉네임 변경', '프로필 이미지 변경', '알림 설정'],
  },
  {
    title: '커뮤니티',
    items: ['팔로잉 & 팔로워', '관심글 목록'],
  },
  {
    title: 'AI 피팅 설정',
    items: ['체형 정보 수정', '나의 AI 모델'],
  },
  {
    title: '이용약관',
    items: ['개인정보 이용 약관', '오픈 라이선스'],
  },
];

/** 설정 화면. 내 정보·커뮤니티·AI 피팅·약관 메뉴와 로그아웃·회원탈퇴를 제공한다. */
export function ProfileSettingsScreen() {
  const { logout, isLoading: loggingOut } = useLogout();
  const { deleteAccount, isLoading: deleting } = useDeleteAccount();

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('회원탈퇴', '정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (e: any) {
            const msg =
              e?.response?.status === 401
                ? '다시 로그인 후 시도해 주세요.'
                : '탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.';
            Alert.alert('탈퇴 실패', msg);
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell title="설정">
      <View className="flex-1 px-4">
        {sections.map((section) => (
          <View key={section.title} className="mb-4">
            <Text variant="label" className="mb-2 mt-2">
              {section.title}
            </Text>
            {section.items.map((item) => (
              <Pressable
                key={item}
                className="py-3 border-b border-border"
                onPress={() => {
                  if (item === '닉네임 변경') router.push('/(tabs)/profile/nickname');
                  if (item === '프로필 이미지 변경') router.push('/(tabs)/profile/profile-image');
                  if (item === '알림 설정') router.push('/(tabs)/profile/notification-settings');
                  if (item === '체형 정보 수정') router.push('/(tabs)/profile/body');
                  if (item === '나의 AI 모델')
                    router.push({ pathname: '/(tabs)/profile/body', params: { tab: 'avatar' } });
                  if (item === '관심글 목록') router.push('/(tabs)/profile/bookmarks');
                  if (item === '팔로잉 & 팔로워') router.push('/(tabs)/profile/followers');
                  if (item === '개인정보 이용 약관') router.push('/(tabs)/profile/privacy-terms');
                  if (item === '오픈 라이선스') router.push('/(tabs)/profile/open-licenses');
                }}
              >
                <Text>{item}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        <Pressable className="py-4" onPress={handleLogout} disabled={loggingOut}>
          <Text className="font-sans-medium">{loggingOut ? '로그아웃 중...' : '로그아웃'}</Text>
        </Pressable>
        <Pressable className="py-2" onPress={handleDeleteAccount} disabled={deleting}>
          <Text className="text-red-500 font-sans">{deleting ? '탈퇴 중...' : '회원탈퇴'}</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
