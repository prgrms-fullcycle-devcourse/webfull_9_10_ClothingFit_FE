import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getTabBarStyle } from '@/constants/tab-bar';
import { TextInput } from '@/components/ui/text-input';
import { useFittingJob, useLatestDoneJob } from '@/features/fitting/store/fitting-job-store';
import { usePatchFittingClosetArchiveIdTitle } from '@/api/generated/endpoints/fitting/fitting';

export function FittingResultScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const byId = useFittingJob(jobId);
  const latest = useLatestDoneJob();
  const job = byId ?? latest;
  const uri = job?.resultImageUri ?? null;
  const insets = useSafeAreaInsets();

  // 코디 이름 입력 (비우면 백엔드 자동 이름 유지)
  const [name, setName] = useState('');
  // 결과 이미지의 실제 비율 — 박스를 이 비율로 맞춰 좌우 여백(액자) 제거
  const [imgAspect, setImgAspect] = useState(3 / 5);
  const renameMut = usePatchFittingClosetArchiveIdTitle();

  const handleSave = () => {
    const title = name.trim();
    const archiveId = job?.archiveId;
    // 이름을 입력했고 archiveId가 있으면 제목 변경 후 이동, 아니면 그냥 이동
    if (title && archiveId) {
      renameMut.mutate(
        { closetArchiveId: archiveId, data: { title } },
        {
          onSettled: () => router.push('/(tabs)/closet'),
        },
      );
    } else {
      router.push('/(tabs)/closet');
    }
  };

  // 결과 확인 화면에서는 하단 탭 바를 숨긴다 (저장 버튼이 탭바와 겹치지 않게).
  const navigation = useNavigation();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: getTabBarStyle(insets) });
  }, [navigation, insets]);

  return (
    <ScreenShell
      title="2D 모델 확인"
      titleVariant="title"
      right={
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          hitSlop={8}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="home-outline" size={22} color="#111827" />
        </Pressable>
      }
    >
      <View className="flex-1 px-4 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text className="mb-4 text-center font-sans">생성된 2D 모델을 확인하세요</Text>
        <View className="flex-1 items-center justify-center mb-4">
          {uri ? (
            // 박스를 이미지 실제 비율에 맞춰 → 좌우/상하 여백(액자) 없이 딱 맞게
            <View
              className="rounded-2xl bg-surface overflow-hidden"
              style={{ aspectRatio: imgAspect, maxHeight: '100%', maxWidth: '100%', width: '100%' }}
            >
              <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode="cover"
                onLoad={(e) => {
                  const s = e.nativeEvent.source;
                  if (s?.width && s?.height) setImgAspect(s.width / s.height);
                }}
              />
            </View>
          ) : (
            <View className="flex-1 w-full rounded-2xl bg-surface items-center justify-center">
              <Text variant="caption">결과 이미지가 아직 없어요 (mock)</Text>
            </View>
          )}
        </View>
        <Text variant="label" className="mb-1">
          코디 이름
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={job?.outfitName ?? '이름을 입력해주세요'}
          className="border border-border rounded-xl px-4 py-3 mb-4"
        />
        <Text variant="caption" className="mb-4">
          생성된 아바타는 자동 저장됩니다.{'\n'}
          제목 변경을 원하시면 코디 이름 작성 후 저장을 눌러주세요.
        </Text>
        {/* 재생성은 고도화 단계로 이관 — 현재 저장만 제공 */}
        <Button
          label={renameMut.isPending ? '저장 중...' : '저장'}
          variant="secondary"
          onPress={handleSave}
        />
      </View>
    </ScreenShell>
  );
}
