import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { SocialButton } from '@/components/ui/social-button';
import { Text } from '@/components/ui/text';

export function LoginScreen() {
  // TODO: 실제 로그인 로직 연동 (현재는 mock — 바로 체형 입력으로 이동)
  const handleLogin = () => router.push('/(auth)/register');

  return (
    <ScreenShell noHeader>
      <View className="flex-1 px-6">
        <View className="flex-1 justify-center gap-4">
          <Image variant="logo" source={require('../../../../assets/images/logo.png')} />
          <View className="gap-1">
            <Text
              variant="title"
              className="text-center text-5xl"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              CLOTHING-FIT
            </Text>
            <Text variant="label" className="text-center text-lg">
              나만의 3D 가상 피팅 어시스턴스
            </Text>
          </View>
        </View>

        <View className="gap-3 pb-8">
          <Text variant="caption" className="text-center underline text-base">
            마지막 사용 로그인
          </Text>
          <View className="gap-4">
            <SocialButton provider="kakao" onPress={handleLogin} />
            <SocialButton provider="google" onPress={handleLogin} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
