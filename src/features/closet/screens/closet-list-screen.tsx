import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { Tag } from '@/components/ui/tag';
import { Text } from '@/components/ui/text';
import { useGetCloset } from '@/api/generated/endpoints/closet/closet';

/** ISO/날짜 문자열 → "2026.04.30" 표기 (파싱 실패 시 원본 그대로) */
function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function ClosetListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useGetCloset();
  const archives = data?.data ?? [];

  return (
    <ScreenShell title="옷장" showBack={false}>
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 py-20">
          <Text variant="caption">옷장을 불러오지 못했어요.</Text>
          <Pressable onPress={() => refetch()} className="bg-primary px-5 py-3 rounded-xl">
            <Text className="text-white font-sans-bold">다시 시도</Text>
          </Pressable>
        </View>
      ) : archives.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 py-20">
          <Text variant="caption">아직 저장된 코디가 없어요.</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/explore')}
            className="bg-primary px-5 py-3 rounded-xl"
          >
            <Text className="text-white font-sans-bold">코디 만들러 가기</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={archives}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
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
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenShell>
  );
}
