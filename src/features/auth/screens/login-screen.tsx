import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { SocialButton } from '@/components/ui/social-button';
import { Text } from '@/components/ui/text';
import { useGoogleLogin } from '@/features/auth/hooks/use-google-login';
import { useKakaoLogin } from '@/features/auth/hooks/use-kakao-login';

type LoginResult = { isNewUser: boolean };

export function LoginScreen() {
  const { signIn: kakaoSignIn, isLoading: kakaoLoading } = useKakaoLogin();
  const { signIn: googleSignIn, isLoading: googleLoading } = useGoogleLogin();
  const busy = kakaoLoading || googleLoading;

  // 카카오·구글 공통 처리: 로그인 → 신규/기존 분기, 취소는 조용히 무시
  const handleLogin = async (signIn: () => Promise<LoginResult | null>) => {
    try {
      const data = await signIn();
      if (!data) return; // 사용자가 취소
      router.replace(data.isNewUser ? '/(auth)/register' : '/(tabs)/home');
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (/cancel/i.test(message)) return;
      Alert.alert('로그인 실패', message || '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenShell noHeader edges={['top', 'bottom']}>
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
            <SocialButton
              provider="kakao"
              onPress={() => handleLogin(kakaoSignIn)}
              disabled={busy}
            />
            <SocialButton
              provider="google"
              onPress={() => handleLogin(googleSignIn)}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
