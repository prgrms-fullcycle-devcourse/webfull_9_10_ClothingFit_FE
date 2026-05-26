import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function LoginScreen() {
  return (
    <ScreenShell title="로그인" showBack={false}>
      <View className="flex-1 px-6 justify-center gap-4">
        <Text variant="title" className="text-center mb-4">
          Clothing-Fit
        </Text>
        <Text variant="caption" className="text-center mb-8">
          mock 로그인 — JWT/소셜 TODO
        </Text>
        <Button label="Google 로그인 (mock)" variant="ghost" />
        <Button label="Kakao 로그인 (mock)" variant="ghost" />
        <Button
          label="이메일 로그인 (mock)"
          variant="secondary"
          onPress={() => router.replace('/(tabs)/home')}
        />
        <Button label="회원가입" variant="ghost" onPress={() => router.push('/(auth)/register')} />
      </View>
    </ScreenShell>
  );
}
