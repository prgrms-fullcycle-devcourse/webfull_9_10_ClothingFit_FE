import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';

import { useTabBarScroll } from '@/features/navigation/use-tab-bar-scroll';

import { AppHeader } from '@/components/blocks/app-header';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { RenameCoordiSheet } from '@/features/closet/components/rename-coordi-sheet';
import {
  getGetClosetQueryKey,
  useDeleteClosetId,
  useGetCloset,
} from '@/api/generated/endpoints/closet/closet';
import { usePatchFittingClosetArchiveIdTitle } from '@/api/generated/endpoints/fitting/fitting';
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

/** 스와이프 시 우측에 드러나는 삭제 버튼 */
function RightDeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-20 items-center justify-center"
      style={{ backgroundColor: '#E24B4A' }}
    >
      <Feather name="trash-2" size={22} color="#fff" />
      <Text className="text-xs mt-1" style={{ color: '#fff' }}>
        삭제
      </Text>
    </Pressable>
  );
}

export function ClosetListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useGetCloset();
  const archives = data?.data ?? [];
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const deleteMut = useDeleteClosetId();
  const scrollHandler = useTabBarScroll();

  // 코디 이름 변경 (편집 아이콘 → 시트)
  const [renameTarget, setRenameTarget] = useState<ClosetListItem | null>(null);
  const renameMut = usePatchFittingClosetArchiveIdTitle();
  const handleRename = (title: string) => {
    if (!renameTarget) return;
    renameMut.mutate(
      { closetArchiveId: renameTarget.id, data: { title } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClosetQueryKey() });
          setRenameTarget(null);
        },
        onError: () => Alert.alert('이름 변경 실패', '잠시 후 다시 시도해 주세요.'),
      },
    );
  };

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
    <ScreenShell noHeader>
      <AppHeader />
      <Text className="font-sans-bold text-xl px-4 pt-3 pb-2">나의 옷장</Text>
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
        <Animated.FlatList
          data={archives}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 80 }}
          ItemSeparatorComponent={() => <View className="h-px bg-border mx-4 my-5" />}
          renderItem={({ item }) => (
            <ReanimatedSwipeable
              friction={2}
              rightThreshold={40}
              overshootRight={false}
              renderRightActions={(_progress, _translation, methods) => (
                <RightDeleteAction
                  onPress={() => {
                    methods.close();
                    handleDelete(item);
                  }}
                />
              )}
            >
              <Pressable
                className="flex-row gap-4 px-4 bg-white"
                onPress={() => router.push(`/(tabs)/closet/${item.id}`)}
              >
                {/* 좌측 메인 이미지 — 고정 비율(3:5)로 모든 코디 동일 크기.
                    contain + 사방 여백(p-2)으로 전신(머리 위·발 아래·양옆)이 잘리지 않게,
                    남는 공간은 연한 회색으로 채워 흰 배경 아바타도 구분되게 */}
                {/* 고정 비율(3:5) 회색 프레임 + 전신 contain.
                    이미지를 scale(0.88)로 줄여 머리 위·발 아래·양옆 사방에 여백을 두고,
                    남는 공간은 연한 회색으로 채워 흰 배경 아바타도 구분되게 */}
                <View
                  className="w-40 overflow-hidden rounded-xl border border-border bg-surface"
                  style={{ aspectRatio: 3 / 5 }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full bg-transparent scale-[1.15] -translate-y-[3px]"
                    contentFit="contain"
                  />
                </View>

                {/* 우측 정보 영역 */}
                <View className="flex-1 justify-between py-0.5">
                  <View>
                    {/* 상단: 3D 태그 (피그마 — 좌우로 길고 납작한 파란 뱃지).
                        3D 유무와 상관없이 항상 같은 높이를 차지하게(없으면 투명) → 제목·옷 위치 고정 */}
                    <View className="flex-row mb-2">
                      <View
                        className={`self-start rounded-full border border-accent px-3.5 py-0.5 ${
                          item.modelUrl ? '' : 'opacity-0'
                        }`}
                      >
                        <Text className="font-sans-medium text-xs text-accent">3D</Text>
                      </View>
                    </View>

                    {/* 제목 + 이름변경 버튼 */}
                    <View className="flex-row items-center gap-1.5 mb-3">
                      <Text className="font-sans-bold text-base flex-shrink" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Pressable onPress={() => setRenameTarget(item)} hitSlop={10}>
                        <Feather name="copy" size={15} color="#9ca3af" />
                      </Pressable>
                    </View>

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
            </ReanimatedSwipeable>
          )}
        />
      )}

      <RenameCoordiSheet
        visible={renameTarget !== null}
        initialName={renameTarget?.title}
        saving={renameMut.isPending}
        onClose={() => setRenameTarget(null)}
        onSubmit={handleRename}
      />
    </ScreenShell>
  );
}
