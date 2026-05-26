import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { useCopySession } from '@/features/webview/hooks/use-copy-session';

export function ClothingCropScreen() {
  const { markCategoryDone, session } = useCopySession();

  return (
    <ScreenShell
      title="의류 영역 선택"
      right={
        <Pressable
          onPress={() => {
            if (session.activeCategory) {
              markCategoryDone(session.activeCategory);
            }
            router.back();
          }}>
          <Text className="text-accent font-sans-bold">완료</Text>
        </Pressable>
      }>
      <View className="flex-1 bg-black/80 items-center justify-center">
        <View className="w-[85%] aspect-[3/4] border-2 border-white rounded-lg items-center justify-center">
          <View className="absolute inset-0 border border-white/30" style={{ opacity: 0.5 }} />
          <Text className="text-white font-sans">crop 영역 (mock)</Text>
        </View>
        <Text className="text-white mt-6 font-sans">모서리를 드래그하여 크기 조절 (TODO)</Text>
      </View>
    </ScreenShell>
  );
}
