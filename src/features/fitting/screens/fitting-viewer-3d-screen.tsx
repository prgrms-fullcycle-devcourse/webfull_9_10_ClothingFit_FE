import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';

export function FittingViewer3dScreen() {
  return (
    <ScreenShell title="3D 뷰어">
      <View className="flex-1 items-center justify-center bg-surface m-4 rounded-2xl">
        <Text variant="subtitle">3D Viewer Placeholder</Text>
        <Text variant="caption" className="mt-2 text-center px-8">
          expo-gl + Meshy .glb 연동 TODO
        </Text>
      </View>
    </ScreenShell>
  );
}
