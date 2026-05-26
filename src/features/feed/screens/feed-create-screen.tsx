import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function FeedCreateScreen() {
  return (
    <ScreenShell title="게시물 작성">
      <View className="flex-1 p-4">
        <View className="h-48 rounded-xl bg-surface items-center justify-center mb-4">
          <Text variant="caption">이미지 업로드 TODO</Text>
        </View>
        <Button label="게시 (mock)" variant="secondary" />
      </View>
    </ScreenShell>
  );
}
