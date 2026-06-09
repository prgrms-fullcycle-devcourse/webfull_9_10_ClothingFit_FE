import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import COLORS from '@/constants/colors';
import { ClosetViewer3D } from '@/features/closet/components/closet-viewer-3d';
import {
  getGetClosetQueryKey,
  useDeleteClosetId,
  useGetClosetId,
  usePostClosetIdPublish,
} from '@/api/generated/endpoints/closet/closet';
import Feather from '@expo/vector-icons/Feather';

const CARD_WIDTH = Dimensions.get('window').width - 32;

export function ClosetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useGetClosetId(id);
  const item = data?.data;
  const wornItems = item?.closetItems ?? [];

  const [view3d, setView3d] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // 서버의 게시 상태로 토글 초기화
  useEffect(() => {
    if (item) setIsPublished(item.isPublished);
  }, [item]);

  const deleteMut = useDeleteClosetId();
  const publishMut = usePostClosetIdPublish();

  // 삭제 (휴지통) — 확인 후 삭제 → 목록 갱신 → 뒤로
  const handleDelete = () => {
    Alert.alert('코디 삭제', '이 코디를 삭제할까요? 게시글도 함께 삭제돼요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          deleteMut.mutate(
            { id },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getGetClosetQueryKey() });
                router.back();
              },
              onError: () => Alert.alert('삭제 실패', '잠시 후 다시 시도해 주세요.'),
            },
          ),
      },
    ]);
  };

  // 게시 토글 — 켤 때만 게시 API 호출 (해제 API는 없음)
  const handlePublishChange = (next: boolean) => {
    if (!next) return; // 게시 해제는 백엔드 미지원
    setIsPublished(true);
    publishMut.mutate(
      { id },
      {
        onError: () => {
          setIsPublished(false);
          Alert.alert('게시 실패', '잠시 후 다시 시도해 주세요.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <ScreenShell title="옷장">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenShell>
    );
  }

  if (isError || !item) {
    return (
      <ScreenShell title="옷장">
        <View className="flex-1 items-center justify-center gap-4">
          <Text variant="caption">코디를 불러오지 못했어요.</Text>
          <Pressable onPress={() => refetch()} className="bg-primary px-5 py-3 rounded-xl">
            <Text className="text-white font-sans-bold">다시 시도</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

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
              disabled={isPublished || publishMut.isPending}
              onValueChange={handlePublishChange}
            />
            <Pressable onPress={handleDelete} hitSlop={8} disabled={deleteMut.isPending}>
              <Feather name="trash-2" size={24} color={COLORS.accent} />
            </Pressable>
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
              {p.imageUrl ? (
                <Image
                  source={{ uri: p.imageUrl }}
                  className="w-16 h-16 rounded-lg bg-surface mr-3"
                />
              ) : (
                <View className="w-16 h-16 rounded-lg bg-surface mr-3" />
              )}
              <View className="flex-1">
                <Text className="font-sans-medium">{p.brand ?? '브랜드 정보 없음'}</Text>
                <Text variant="caption">{p.name}</Text>
                {p.size ? <Text variant="caption">착용사이즈 {p.size}</Text> : null}
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
