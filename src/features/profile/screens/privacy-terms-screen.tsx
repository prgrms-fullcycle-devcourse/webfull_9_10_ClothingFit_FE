import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';

// TODO: 실제 약관 본문으로 교체 (현재 플레이스홀더)
const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. 수집하는 개인정보 항목',
    body: '소셜 로그인 식별자, 닉네임, 프로필 이미지, 신체 정보(키·몸무게 등), 업로드한 사진.',
  },
  {
    heading: '2. 개인정보의 이용 목적',
    body: '회원 식별·관리, AI 피팅/아바타 생성, 커뮤니티 기능 제공, 서비스 개선.',
  },
  {
    heading: '3. 보유 및 이용 기간',
    body: '회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 그 기간 동안 보관합니다.',
  },
  {
    heading: '4. 제3자 제공',
    body: '원칙적으로 외부에 제공하지 않으며, 법령에 근거가 있는 경우에 한해 제공할 수 있습니다.',
  },
];

export function PrivacyTermsScreen() {
  return (
    <ScreenShell title="개인정보 이용 약관">
      <ScrollView className="flex-1 px-5" contentContainerClassName="py-4 gap-4">
        <Text variant="caption">최종 업데이트: 2026-06-09</Text>
        {SECTIONS.map((s) => (
          <View key={s.heading} className="gap-1">
            <Text className="font-sans-medium">{s.heading}</Text>
            <Text variant="caption" className="leading-5">
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
