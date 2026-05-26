import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function FittingHomeScreen() {
  return (
    <ScreenShell title="AI 피팅" showBack={false}>
      <View className="flex-1 px-4 py-6 gap-4">
        <Text variant="title">AI 가상 피팅</Text>
        <Text variant="caption">mock 뼈대 — Gemini/Meshy 연동 TODO</Text>

        <Button label="쇼핑몰 COPY (WebView)" onPress={() => router.push('/(tabs)/explore')} />
        <Button
          label="의상 최종 확인"
          variant="secondary"
          onPress={() => router.push('/(tabs)/fitting/confirm')}
        />
        <Button
          label="피팅 진행 (mock SSE)"
          variant="ghost"
          onPress={() => router.push('/(tabs)/fitting/mock-job-1')}
        />
        <Button
          label="2D 결과 확인"
          variant="ghost"
          onPress={() => router.push('/(tabs)/fitting/result')}
        />
        <Button
          label="3D 뷰어 (placeholder)"
          variant="ghost"
          onPress={() => router.push('/(tabs)/fitting/viewer-3d')}
        />
        <Button label="나의 옷장" variant="ghost" onPress={() => router.push('/(tabs)/closet')} />
      </View>
    </ScreenShell>
  );
}
