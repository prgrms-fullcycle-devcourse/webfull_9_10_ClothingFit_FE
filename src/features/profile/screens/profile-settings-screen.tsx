import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { getTabBarStyle } from '@/constants/tab-bar';
import { useDeleteAccount } from '@/features/auth/hooks/use-delete-account';
import { useLogout } from '@/features/auth/hooks/use-logout';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/features/notifications/api';
import { cn } from '@/utils/cn';

const sections = [
  {
    title: '내 정보',
    items: ['닉네임 변경', '프로필 이미지 변경', '알림 설정'],
  },
  {
    title: '커뮤니티',
    items: ['팔로잉 & 팔로워 설정', '관심글 목록'],
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

// 메뉴 항목 → 이동 경로
function goTo(item: string) {
  if (item === '닉네임 변경') router.push('/(tabs)/profile/nickname');
  if (item === '프로필 이미지 변경') router.push('/(tabs)/profile/profile-image');
  if (item === '체형 정보 수정') router.push('/(tabs)/profile/body');
  if (item === '나의 AI 모델')
    router.push({ pathname: '/(tabs)/profile/body', params: { tab: 'avatar' } });
  if (item === '관심글 목록') router.push('/(tabs)/profile/bookmarks');
  if (item === '팔로잉 & 팔로워 설정') router.push('/followers');
  if (item === '개인정보 이용 약관') router.push('/(tabs)/profile/privacy-terms');
  if (item === '오픈 라이선스') router.push('/(tabs)/profile/open-licenses');
}

/** 설정 화면. 내 정보·커뮤니티·AI 피팅·약관 메뉴와 로그아웃·회원탈퇴를 제공한다. */
export function ProfileSettingsScreen() {
  const { logout, isLoading: loggingOut } = useLogout();
  const { deleteAccount, isLoading: deleting } = useDeleteAccount();
  const notiSettings = useNotificationSettings();
  const updateNoti = useUpdateNotificationSettings();
  const notiEnabled = notiSettings.data?.enabled ?? false;

  // 하단 탭 바가 로그아웃·회원탈퇴를 가리므로 이 화면에선 탭 바를 숨긴다 (떠날 때 복원).
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: getTabBarStyle(insets) });
  }, [navigation, insets]);

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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, idx) => (
          <View
            key={section.title}
            className={cn('py-5', idx < sections.length - 1 && 'border-b border-border')}
          >
            <Text className="font-sans-bold text-lg mb-4">{section.title}</Text>
            <View className="gap-4">
              {section.items.map((item) =>
                item === '알림 설정' ? (
                  // 알림 설정: 인라인 토글 (푸시 알림 설정 API 연동). 켜짐=오른쪽(ON).
                  <View key={item} className="flex-row items-center justify-between">
                    <Text
                      className="text-muted text-[15px] font-sans-bold"
                      style={{ lineHeight: 20, includeFontPadding: false }}
                    >
                      알림 설정
                    </Text>
                    <Toggle
                      labelLeft="OFF"
                      labelRight="ON"
                      value={notiEnabled}
                      disabled={notiSettings.isLoading || updateNoti.isPending}
                      onValueChange={(on) => updateNoti.mutate({ data: { enabled: on } })}
                    />
                  </View>
                ) : (
                  <Pressable key={item} onPress={() => goTo(item)}>
                    <Text
                      className="text-muted text-[15px] font-sans-bold"
                      style={{ lineHeight: 20, includeFontPadding: false }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        ))}

        <View className="items-center gap-5 pt-10">
          <Pressable onPress={handleLogout} disabled={loggingOut}>
            <Text className="text-muted font-sans-bold">
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </Text>
          </Pressable>
          <Pressable onPress={handleDeleteAccount} disabled={deleting}>
            <Text
              className="text-red-500 font-sans-bold text-[17px]"
              style={{ lineHeight: 20, includeFontPadding: false }}
            >
              {deleting ? '탈퇴 중' : '회원탈퇴'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
