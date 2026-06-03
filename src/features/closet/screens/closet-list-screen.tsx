import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
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
            className="flex-row gap-3"
            onPress={() => router.push(`/(tabs)/closet/${item.id}`)}
          >
            <View className="w-44" style={{ aspectRatio: 3 / 5 }}>
              <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-none" />
            </View>

            <View className="flex-1">
              <View>
                <View className="flex-row items-center gap-2 m-2">
                  <Text className="font-sans-medium flex-shrink">{item.title}</Text>
                  {item.modelUrl && <Tag text="3D" />}
                </View>

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
