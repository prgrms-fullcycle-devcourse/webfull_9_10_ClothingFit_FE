import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import COLORS from '@/constants/colors';
import { ClosetViewer3D } from '@/features/closet/components/closet-viewer-3d';
import { MOCK_CLOSET_ARCHIVES, MOCK_CLOSET_ITEMS } from '@/mocks/data';
import Feather from '@expo/vector-icons/Feather';

const CARD_WIDTH = Dimensions.get('window').width - 32;
export function ClosetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = MOCK_CLOSET_ARCHIVES.find((c) => c.id === id) ?? MOCK_CLOSET_ARCHIVES[0];
  const wornItems = MOCK_CLOSET_ITEMS.filter((ci) => ci.closetArchiveId === item.id);
  const [view3d, setView3d] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  return (
    <ScreenShell title={item.title} noHeader>
      <ScreenHeader
        title={item.title}
        right={
          <View className="flex flex-row gap-4 items-center">
            <Toggle
              labelLeft="off"
              labelRight="on"
              value={isPublished}
              onValueChange={setIsPublished}
            />
            <Feather name="trash-2" size={24} color={COLORS.accent} />
          </View>
        }
      />
      {/* 뷰어 영역 */}
      <View style={{ height: 440 }}>
        {view3d && item.modelUrl ? (
          <ClosetViewer3D modelUrl={item.modelUrl} />
        ) : (
          <Image
            className="flex-1 bg-surface items-center justify-center"
            source={{ uri: item.imageUrl }}
          />
        )}
      </View>
      {/* 2D / 3D 토글 */}
      <View className="flex-row justify-end px-4 py-2 border-b border-border">
        <Toggle
          labelLeft="2D"
          labelRight="3D"
          value={view3d}
          onValueChange={setView3d}
          disabled={!item.modelUrl}
        />
      </View>

      <View className="py-4">
        <Text variant="subtitle" className="mb-3 px-4">
          착용 제품
        </Text>
        <FlatList
          data={wornItems}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="normal"
          disableIntervalMomentum
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item: p }) => (
            <View
              style={{ width: CARD_WIDTH }}
              className="flex-row items-center p-3 rounded-xl border border-border"
            >
              <View className="w-16 h-16 rounded-lg bg-surface mr-3" />
              <View className="flex-1">
                <Text className="font-sans-medium">{p.brand}</Text>
                <Text variant="caption">{p.name}</Text>
                <Text variant="caption">착용사이즈 {p.size}</Text>
              </View>
            </View>
          )}
        />
      </View>

      <View className="px-4 gap-2 border-t border-border">
        <Button label="아바타 재생성" />
      </View>
    </ScreenShell>
  );
}
