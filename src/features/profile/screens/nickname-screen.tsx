import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';

export function NicknameScreen() {
  return (
    <ScreenShell title="닉네임 변경">
      <View className="flex-1 p-4">
        <Text variant="label" className="mb-2">
          변경할 닉네임
        </Text>
        <TextInput
          defaultValue="신나는 카피바라"
          className="border border-border rounded-xl px-4 py-3 mb-3"
        />
        <Button label="중복확인 (mock)" variant="ghost" className="mb-3" />
        <Text variant="caption" className="mb-6">
          사용 가능한 아이디입니다. 변경하기를 눌러주세요.
        </Text>
        <Button label="변경하기" variant="secondary" />
      </View>
    </ScreenShell>
  );
}
