import { router } from 'expo-router';
import { FlatList, Image, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Tag } from '@/components/ui/tag';
import { Text } from '@/components/ui/text';
import { MOCK_CLOSET_ARCHIVES } from '@/mocks/data';

export function ClosetListScreen() {
  return (
    <ScreenShell title="옷장" showBack={false}>
      <FlatList
        data={MOCK_CLOSET_ARCHIVES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row gap-3 "
            onPress={() => router.push(`/(tabs)/closet/${item.id}`)}
          >
            {/* 왼쪽: 대표 이미지 */}
            <Image
              source={{ uri: item.imageUrl }}
              className="w-44 bg-surface"
              style={{ aspectRatio: 3 / 5 }}
            />

            {/* 오른쪽 */}
            <View className="flex-1 justify-between">
              {/* 상단: 제목 + 3D 태그 */}
              <View>
                <View className="flex-row items-center gap-2 m-2">
                  <Text className="font-sans-medium flex-shrink">{item.title}</Text>
                  {item.modelUrl && <Tag text="3D" />}
                </View>

                {/* closetItems 이미지 그리드 */}
                <View className="flex-row flex-wrap">
                  {item.closetItems.map((ci) => (
                    <View key={ci.id} className="w-1/3 p-1">
                      {ci.imageUrl ? (
                        <Image
                          source={{ uri: ci.imageUrl }}
                          className="w-full aspect-square rounded-md bg-surface"
                        />
                      ) : (
                        <View className="w-full aspect-square rounded-md bg-surface" />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* 하단: 날짜 */}
              <Text variant="caption" className="text-right mt-2 mr-2">
                {item.createdAt}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
