import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';

export function RegisterScreen() {
  return (
    <ScreenShell title="회원가입">
      <View className="flex-1 p-4 gap-3">
        <TextInput placeholder="이메일" className="border border-border rounded-xl px-4 py-3" />
        <TextInput placeholder="비밀번호" className="border border-border rounded-xl px-4 py-3" />
        <TextInput placeholder="닉네임" className="border border-border rounded-xl px-4 py-3" />
        <Button
          label="가입하기 (mock)"
          variant="secondary"
          className="mt-4"
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </ScreenShell>
  );
}
