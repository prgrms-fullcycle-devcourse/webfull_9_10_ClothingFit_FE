import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MOCK_CLOSET_ITEMS, MOCK_WORN_PRODUCTS } from '@/mocks/data';

export function ClosetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = MOCK_CLOSET_ITEMS.find((c) => c.id === id) ?? MOCK_CLOSET_ITEMS[0];

  return (
    <ScreenShell title={item.name}>
      <View className="h-80 bg-surface items-center justify-center">
        <Text variant="caption">2D / 3D toggle TODO</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-4">
        <Text variant="subtitle" className="mb-3">
          착용 제품
        </Text>
        {MOCK_WORN_PRODUCTS.map((p) => (
          <View key={p.id} className="flex-row items-center mb-3 p-3 rounded-xl border border-border">
            <View className="w-12 h-12 rounded-lg bg-surface mr-3" />
            <View className="flex-1">
              <Text className="font-sans-medium">{p.brand}</Text>
              <Text variant="caption">{p.name}</Text>
              <Text variant="caption">착용사이즈 {p.size}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="p-4 gap-2 border-t border-border">
        <Button label="아바타 재생성 (mock)" variant="secondary" />
        <Button label="커뮤니티 공유 토글 TODO" variant="ghost" />
      </View>
    </ScreenShell>
  );
}
