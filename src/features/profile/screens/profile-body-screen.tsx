import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { MOCK_USER } from '@/mocks/data';

export function ProfileBodyScreen() {
  return (
    <ScreenShell title="체형 정보">
      <View className="flex-1 p-4 gap-4">
        <Text variant="caption">3D 아바타 기반 신체 데이터 (mock)</Text>
        <Text variant="label">키 (cm)</Text>
        <TextInput
          defaultValue={String(MOCK_USER.height)}
          className="border border-border rounded-xl px-4 py-3"
        />
        <Text variant="label">몸무게 (kg)</Text>
        <TextInput
          defaultValue={String(MOCK_USER.weight)}
          className="border border-border rounded-xl px-4 py-3"
        />
        <Text variant="label">성별</Text>
        <TextInput
          defaultValue={MOCK_USER.gender}
          className="border border-border rounded-xl px-4 py-3"
        />
        <Button label="저장 (mock)" variant="secondary" className="mt-4" />
      </View>
    </ScreenShell>
  );
}
