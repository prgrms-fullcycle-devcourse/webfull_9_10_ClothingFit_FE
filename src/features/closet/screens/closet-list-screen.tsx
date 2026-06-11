import { router } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { Tag } from '@/components/ui/tag';
import { Text } from '@/components/ui/text';
import COLORS from '@/constants/colors';
import {
  getGetClosetQueryKey,
  useDeleteClosetId,
  useGetCloset,
} from '@/api/generated/endpoints/closet/closet';
import type { ClosetListItem } from '@/api/generated/schemas';

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
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const deleteMut = useDeleteClosetId();

  // 코디 삭제 — 확인 후 삭제 → 목록 갱신
  const handleDelete = (item: ClosetListItem) => {
    Alert.alert('코디 삭제', `'${item.title}'을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          deleteMut.mutate(
            { id: item.id },
            {
              onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetClosetQueryKey() }),
              onError: () => Alert.alert('삭제 실패', '잠시 후 다시 시도해 주세요.'),
            },
          ),
      },
    ]);
  };

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
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 80 }}
          ItemSeparatorComponent={() => <View className="h-px bg-border mx-4 my-5" />}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row gap-4 px-4"
              onPress={() => router.push(`/(tabs)/closet/${item.id}`)}
            >
              {/* 좌측 메인 이미지 */}
              <View className="w-40" style={{ aspectRatio: 3 / 5 }}>
                <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-xl" />
              </View>

              {/* 우측 정보 영역 */}
              <View className="flex-1 justify-between py-0.5">
                <View>
                  {/* 상단: 3D 태그 + 삭제 버튼 */}
                  <View className="flex-row items-center justify-between mb-2">
                    {item.modelUrl ? <Tag text="3D" /> : <View />}
                    <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                      <Feather name="trash-2" size={20} color={COLORS.accent} />
                    </Pressable>
                  </View>

                  {/* 제목 */}
                  <Text className="font-sans-bold text-base mb-3" numberOfLines={1}>
                    {item.title}
                  </Text>

                  {/* 착용 제품 썸네일 그리드 */}
                  <View className="flex-row flex-wrap -m-0.5">
                    {item.closetItems.map((ci) => (
                      <View key={ci.id} className="w-1/3 p-0.5">
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

                {/* 날짜 */}
                <Text variant="caption" className="text-right text-muted mt-3">
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
