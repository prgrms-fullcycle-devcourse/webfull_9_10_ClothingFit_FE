import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { SocialButton } from '@/components/ui/social-button';
import { Text } from '@/components/ui/text';
import { useKakaoLogin } from '@/features/auth/hooks/use-kakao-login';

export function LoginScreen() {
  const { signIn, isLoading } = useKakaoLogin();

  const handleKakaoLogin = async () => {
    try {
      const data = await signIn();
      // 신규 유저면 체형/아바타 등록, 기존 유저면 홈으로
      router.replace(data.isNewUser ? '/(auth)/register' : '/(tabs)/home');
    } catch (e) {
      // 사용자가 카카오 로그인 창을 닫은 경우는 조용히 무시
      const message = e instanceof Error ? e.message : '';
      if (/cancel/i.test(message)) return;
      Alert.alert('로그인 실패', message || '잠시 후 다시 시도해 주세요.');
    }
  };

  // TODO: 구글 로그인 연동 (현재는 mock — 바로 체형 입력으로 이동)
  const handleGoogleLogin = () => router.push('/(auth)/register');

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
            <SocialButton provider="kakao" onPress={handleKakaoLogin} disabled={isLoading} />
            <SocialButton provider="google" onPress={handleGoogleLogin} disabled={isLoading} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
