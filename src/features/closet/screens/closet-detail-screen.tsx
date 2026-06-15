import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import {
  getGetClosetIdQueryKey,
  getGetClosetQueryKey,
  useDeleteClosetId,
  useGetClosetId,
  usePostClosetIdPublish,
} from '@/api/generated/endpoints/closet/closet';
import { usePatchFittingClosetArchiveIdTitle } from '@/api/generated/endpoints/fitting/fitting';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import COLORS from '@/constants/colors';
import { getTabBarStyle } from '@/constants/tab-bar';
import { unpublishPost } from '@/features/closet/api/community-publish-api';
import { ClosetViewer3D } from '@/features/closet/components/closet-viewer-3d';
import { RenameCoordiSheet } from '@/features/closet/components/rename-coordi-sheet';
import { useFitting3D } from '@/features/closet/store/fitting-3d-store';
import Feather from '@expo/vector-icons/Feather';

// 아바타 뷰어 높이 — 첫 화면에 아바타가 크게 보이고, 아래로 스크롤하면 착용 제품이 이어진다
const VIEWER_HEIGHT = Math.round(Dimensions.get('window').height * 0.58);

export function ClosetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetClosetId(id);
  const item = data?.data;
  const wornItems = item?.closetItems ?? [];
  // 생성된 ClosetDetail 타입엔 아직 없지만 백엔드는 postId를 내려줌 (내리기에 필요)
  const postId = (item as { postId?: string | null } | undefined)?.postId ?? null;

  const [view3d, setView3d] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [isPublished, setIsPublished] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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
  const unpublishMut = useMutation({ mutationFn: (pid: string) => unpublishPost(pid) });
  const renameMut = usePatchFittingClosetArchiveIdTitle();

  // 코디 이름 변경 → 옷장 상세·목록 갱신
  const handleRename = (title: string) => {
    renameMut.mutate(
      { closetArchiveId: id, data: { title } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClosetIdQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetClosetQueryKey() });
          setRenameOpen(false);
        },
        onError: () => Alert.alert('이름 변경 실패', '잠시 후 다시 시도해 주세요.'),
      },
    );
  };

  // 3D 모델 생성 (Mesh AI) — 전역 스토어 (화면 나가도 진행 유지). 실패 알림은 전역 배너가 처리.
  const gen = useFitting3D(id);
  useEffect(() => {
    if (gen.status === 'SUCCEEDED') setView3d(true); // 완료되면 3D 뷰로 전환
  }, [gen.status]);

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

  // 게시 토글 — on=공개(게시), off=내리기(연결 게시글 삭제)
  const handlePublishChange = (next: boolean) => {
    if (next) {
      // 공개
      setIsPublished(true);
      publishMut.mutate(
        { id },
        {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetClosetIdQueryKey(id) }),
          onError: () => {
            setIsPublished(false);
            Alert.alert('게시 실패', '잠시 후 다시 시도해 주세요.');
          },
        },
      );
    } else {
      // 내리기 — 연결된 게시글 삭제
      if (!postId) return;
      setIsPublished(false);
      unpublishMut.mutate(postId, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetClosetIdQueryKey(id) }),
        onError: () => {
          setIsPublished(true);
          Alert.alert('내리기 실패', '잠시 후 다시 시도해 주세요.');
        },
      });
    }
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
        onTitlePress={() => setRenameOpen(true)}
        right={
          <View className="flex flex-row gap-4 items-center">
            <Pressable onPress={() => setShareOpen(true)} hitSlop={8}>
              <Ionicons
                name={isPublished ? 'share-social' : 'share-social-outline'}
                size={24}
                color={isPublished ? COLORS.accent : COLORS.primary}
              />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} disabled={deleteMut.isPending}>
              <Feather name="trash-2" size={24} color={COLORS.accent} />
            </Pressable>
          </View>
        }
      />
      {/* 아바타 뷰어(헤더) + 착용 제품(세로 목록)을 한 스크롤로 — 아래로 내려 제품 확인 */}
      <FlatList
        data={wornItems}
        keyExtractor={(p) => p.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={
          <View>
            {/* 뷰어 영역 — 고정 높이. 2D는 전신이 잘리지 않게 contain */}
            <View style={{ height: VIEWER_HEIGHT }} className="bg-surface">
              {view3d && item.modelUrl ? (
                <ClosetViewer3D
                  modelUrl={item.modelUrl}
                  onScrollLock={(locked) => setScrollEnabled(!locked)}
                />
              ) : (
                <Image className="flex-1" source={{ uri: item.imageUrl }} resizeMode="contain" />
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
              <Toggle
                labelLeft="2D"
                labelRight="3D"
                value={view3d}
                onValueChange={handleToggle3D}
              />
            </View>
            {/* 착용 제품 헤더 */}
            <Text variant="subtitle" className="mt-4 mb-3 px-4">
              착용 제품
            </Text>
          </View>
        }
        renderItem={({ item: p }) => (
          <Pressable
            className="mx-4 mb-3 flex-row items-center p-3 rounded-xl border border-border"
            disabled={!p.externalLink}
            onPress={() => p.externalLink && Linking.openURL(p.externalLink)}
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
            {p.externalLink ? (
              <View className="flex-row items-center gap-1 ml-2">
                <Text variant="caption" className="text-primary">
                  보기
                </Text>
                <Feather name="external-link" size={15} color={COLORS.accent} />
              </View>
            ) : null}
          </Pressable>
        )}
      />

      <RenameCoordiSheet
        visible={renameOpen}
        initialName={item.title}
        saving={renameMut.isPending}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
      />

      {/* 커뮤니티 공유 — 공유 아이콘 탭 시 올라오는 바텀시트 (off/on 토글 대체) */}
      <BottomSheet visible={shareOpen} onClose={() => setShareOpen(false)}>
        <View className="px-5 pt-2 pb-4">
          <Text className="font-sans-bold text-lg mb-1">커뮤니티 공유</Text>
          {isPublished ? (
            <>
              <View className="flex-row items-center gap-2 mt-2 mb-5">
                <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                <Text variant="caption" className="text-muted">
                  지금 커뮤니티에 게시 중이에요.
                </Text>
              </View>
              <Button
                label={unpublishMut.isPending ? '내리는 중...' : '게시 내리기'}
                variant="danger"
                disabled={unpublishMut.isPending}
                onPress={() => {
                  handlePublishChange(false);
                  setShareOpen(false);
                }}
              />
            </>
          ) : (
            <>
              <Text variant="caption" className="text-muted mt-2 mb-5">
                이 코디를 커뮤니티에 게시하면 다른 사람들이 볼 수 있어요.
              </Text>
              <Button
                label={publishMut.isPending ? '게시 중...' : '커뮤니티에 게시'}
                variant="secondary"
                disabled={publishMut.isPending}
                onPress={() => {
                  handlePublishChange(true);
                  setShareOpen(false);
                }}
              />
            </>
          )}
        </View>
      </BottomSheet>
    </ScreenShell>
  );
}
