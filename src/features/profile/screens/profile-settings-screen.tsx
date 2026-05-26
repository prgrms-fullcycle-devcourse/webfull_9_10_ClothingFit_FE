import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';

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

export function ProfileSettingsScreen() {
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
                  if (item === '체형 정보 수정') router.push('/(tabs)/profile/body');
                  if (item === '관심글 목록') router.push('/(tabs)/profile/bookmarks');
                  if (item === '팔로잉 & 팔로워') router.push('/(tabs)/profile/followers');
                }}>
                <Text>{item}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        <Pressable className="py-4" onPress={() => router.replace('/(auth)/login')}>
          <Text className="font-sans-medium">로그아웃</Text>
        </Pressable>
        <Pressable className="py-2">
          <Text className="text-red-500 font-sans">회원탈퇴</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
