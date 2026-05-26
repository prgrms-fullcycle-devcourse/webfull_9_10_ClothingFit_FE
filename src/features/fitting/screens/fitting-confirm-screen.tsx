import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MOCK_FITTING_ITEMS } from '@/mocks/data';

export function FittingConfirmScreen() {
  return (
    <ScreenShell title="의상 최종 확인">
      <ScrollView className="flex-1 px-4 py-4">
        <Text variant="caption" className="mb-4">
          2D 아바타 생성 전 — mock 데이터 (최대 5벌)
        </Text>
        {MOCK_FITTING_ITEMS.map((item) => (
          <View key={item.id} className="mb-3 p-4 rounded-xl border border-border flex-row gap-3">
            <View className="w-16 h-16 rounded-lg bg-surface" />
            <View className="flex-1">
              <Text className="font-sans-medium">{item.brand}</Text>
              <Text variant="caption">{item.name}</Text>
              <Button label="사이즈 선택 (mock)" variant="ghost" className="mt-2 py-2" />
            </View>
          </View>
        ))}
        <Button label="신체 치수 수정하기" variant="ghost" onPress={() => router.push('/(tabs)/profile/body')} />
      </ScrollView>
      <View className="p-4 border-t border-border">
        <Button
          label="생성 (mock)"
          onPress={() => router.push('/(tabs)/fitting/mock-job-1')}
        />
      </View>
    </ScreenShell>
  );
}
