import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';

export function FittingResultScreen() {
  return (
    <ScreenShell title="2D 모델 확인">
      <View className="flex-1 px-4 py-4">
        <Text className="mb-4 text-center font-sans">생성된 2D 모델을 확인하세요</Text>
        <View className="flex-1 rounded-2xl bg-surface items-center justify-center mb-4">
          <Text variant="caption">mock 2D 아바타 이미지</Text>
        </View>
        <Text variant="label" className="mb-1">
          코디 이름
        </Text>
        <TextInput
          placeholder="이름을 입력해주세요"
          className="border border-border rounded-xl px-4 py-3 mb-4"
        />
        <Text variant="caption" className="mb-4">
          생성된 아바타는 자동 저장됩니다. (mock)
        </Text>
        <View className="flex-row gap-3">
          <Button label="재생성" variant="ghost" className="flex-1" />
          <Button
            label="저장"
            variant="secondary"
            className="flex-1"
            onPress={() => router.push('/(tabs)/closet')}
          />
        </View>
      </View>
    </ScreenShell>
  );
}
