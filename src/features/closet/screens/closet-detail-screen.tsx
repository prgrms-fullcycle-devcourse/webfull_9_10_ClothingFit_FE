import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import COLORS from '@/constants/colors';
import { getTabBarStyle } from '@/constants/tab-bar';
import { ClosetViewer3D } from '@/features/closet/components/closet-viewer-3d';
import { useFitting3D } from '@/features/closet/hooks/use-fitting-3d';
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
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetClosetId(id);
  const item = data?.data;
  const wornItems = item?.closetItems ?? [];

  const [view3d, setView3d] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // 상세 코디 화면에서는 하단 탭 바를 숨긴다 (떠날 때 복원).
  const navigation = useNavigation();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: getTabBarStyle(insets) });
  }, [navigation, insets]);

  // 서버의 게시 상태로 토글 초기화
  useEffect(() => {
    if (item) setIsPublished(item.isPublished);
  }, [item]);

  const deleteMut = useDeleteClosetId();
  const publishMut = usePostClosetIdPublish();

  // 3D 모델 생성 (Mesh AI) — 시작 + 폴링
  const gen = useFitting3D(id);
  useEffect(() => {
    if (gen.status === 'SUCCEEDED') setView3d(true); // 완료되면 3D 뷰로 전환
    if (gen.status === 'FAILED') Alert.alert('3D 생성 실패', '잠시 후 다시 시도해 주세요.');
  }, [gen.status]);
  useEffect(() => {
    if (gen.startError)
      Alert.alert('3D 생성 시작 실패', '이미 진행 중이거나 잠시 후 다시 시도해 주세요.');
  }, [gen.startError]);

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

  // 2D/3D 토글 — 3D로 전환 시 모델 없으면 생성 확인창
  const handleToggle3D = (next: boolean) => {
    if (!next) {
      setView3d(false);
      return;
    }
    // 3D 요청
    if (item?.modelUrl) {
      setView3d(true); // 이미 모델 있으면 바로 전환
      return;
    }
    if (gen.isGenerating) return; // 생성 중이면 무시
    Alert.alert('3D 아바타 생성', '3D 아바타를 생성하시겠습니까?\n완료까지 수 분 정도 걸려요.', [
      { text: '아니요', style: 'cancel' },
      { text: '네', onPress: () => gen.start() },
    ]);
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
      {/* 뷰어 영역 — 남는 공간을 채우도록 유연하게 (작은 화면에서 하단 잘림 방지) */}
      <View className="flex-1" style={{ minHeight: 240 }}>
        {view3d && item.modelUrl ? (
          <ClosetViewer3D modelUrl={item.modelUrl} />
        ) : (
          <Image
            className="flex-1 bg-surface items-center justify-center"
            source={{ uri: item.imageUrl }}
          />
        )}
      </View>
      {/* 진행률(생성 중) + 2D/3D 토글 (토글이 3D 생성 트리거) */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-border">
        {gen.isGenerating ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text variant="caption" className="text-muted">
              {gen.status === 'QUEUED'
                ? '대기 중...'
                : gen.isSaving
                  ? '저장 중...'
                  : `3D 생성 중 ${gen.progress ? `${gen.progress}%` : ''}`}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <Toggle labelLeft="2D" labelRight="3D" value={view3d} onValueChange={handleToggle3D} />
      </View>

      <View className="pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
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
    </ScreenShell>
  );
}
