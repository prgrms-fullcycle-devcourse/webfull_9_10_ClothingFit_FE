import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { useBodyMeasurements } from '@/features/fitting/hooks/use-body-measurements';
import { startFittingJob } from '@/features/fitting/store/fitting-job-store';
import { checkFit } from '@/features/fitting/utils/fit-check';
import type { FittingItem } from '@/features/fitting/types';
import { BodyMeasureSheet } from '@/features/webview/components/body-measure-sheet';
import { SizeSelectSheet } from '@/features/webview/components/size-select-sheet';
import { CATEGORIES } from '@/features/webview/constants/categories';
import type { CategoryId } from '@/features/webview/constants/categories';
import { useCopySession } from '@/features/webview/hooks/use-copy-session';
import { MOCK_USER } from '@/mocks/data';
import { cn } from '@/utils/cn';

export function FittingConfirmScreen() {
  const { session, setSlotSize } = useCopySession();
  const insets = useSafeAreaInsets();
  const body = useBodyMeasurements();
  // 어떤 슬롯의 사이즈 시트가 열려있는지 (null=닫힘)
  const [sizeSheetCat, setSizeSheetCat] = useState<CategoryId | null>(null);
  const [bodySheetOpen, setBodySheetOpen] = useState(false);

  // 의상 최종 확인 화면에서는 하단 탭 바를 숨긴다 (떠날 때 복원).
  const navigation = useNavigation();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  const done = CATEGORIES.filter((c) => session.slots[c.id].status === 'done').map((c) => ({
    category: c.id,
    label: c.label,
    slot: session.slots[c.id],
  }));

  // 슬롯의 선택 사이즈 ↔ 체형 핏 판정 (체형은 mock — body_info API 연동 전)
  const slotFit = (d: (typeof done)[number]) =>
    d.slot.selectedSize
      ? checkFit({
          category: d.category,
          selectedSize: d.slot.selectedSize,
          sizeTable: d.slot.sizeTable,
          sizeTableSource: d.slot.sizeTableSource,
          sizeOptions: d.slot.sizeOptions,
          body,
        })
      : null;

  const doGenerate = () => {
    const items: FittingItem[] = done.map((d) => ({
      category: d.category,
      label: d.label,
      imageUri: d.slot.imageUri,
      selectedSize: d.slot.selectedSize,
      measurements: d.slot.measurements,
      measurementSource: d.slot.measurementSource,
      title: d.slot.title,
      brand: d.slot.brand,
      productName: d.slot.productName,
      sourceUrl: d.slot.sourceUrl,
      sizeTable: d.slot.sizeTable,
      sizeTableSource: d.slot.sizeTableSource,
    }));
    const id = startFittingJob(items);
    router.push({ pathname: '/(tabs)/fitting/[jobId]', params: { jobId: id } });
  };

  const handleGenerate = () => {
    // 1) 사이즈 미선택 검증 (사이즈를 골라야 핏 판단도 가능하므로 먼저)
    const unselected = done.filter((d) => !d.slot.selectedSize);
    if (unselected.length > 0) {
      Alert.alert(
        '사이즈를 선택해 주세요',
        `아직 사이즈를 고르지 않은 옷이 있어요: ${unselected.map((d) => d.label).join(', ')}`,
      );
      return;
    }

    // 2) 신체보다 작은 사이즈 검증
    const tooSmall = done.filter((d) => slotFit(d)?.verdict === 'small');
    if (tooSmall.length > 0) {
      Alert.alert(
        '사이즈를 수정해 주세요',
        `신체 사이즈보다 작은 옷이 있어요: ${tooSmall.map((d) => d.label).join(', ')}`,
      );
      return;
    }

    // 3) 둘 다 통과 → 생성
    doGenerate();
  };

  const sizeSheetSlot = sizeSheetCat ? session.slots[sizeSheetCat] : null;

  return (
    <ScreenShell title="의상 최종 확인" onBack={() => router.replace('/(tabs)/explore')}>
      <ScrollView className="flex-1 px-4 py-4" contentContainerClassName="pb-4">
        {done.length === 0 ? (
          <View className="items-center py-16 gap-4">
            <Text variant="caption">아직 담은 옷이 없어요.</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              className="bg-primary px-5 py-3 rounded-xl"
            >
              <Text className="text-white font-sans-bold">쇼핑몰 COPY 하러 가기</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 카드 2열 그리드 */}
            <View className="flex-row flex-wrap -mx-1.5">
              {done.map((d) => {
                const hasSize = !!d.slot.selectedSize;
                const fit = slotFit(d);
                const tooSmall = fit?.verdict === 'small';
                return (
                  <View key={d.category} className="w-1/2 px-1.5 mb-3">
                    <View
                      className={cn(
                        'rounded-2xl border overflow-hidden',
                        tooSmall ? 'border-red-400' : 'border-border',
                      )}
                    >
                      {d.slot.imageUri ? (
                        <Image
                          source={{ uri: d.slot.imageUri }}
                          className="w-full aspect-square"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full aspect-square bg-surface" />
                      )}
                      <View className="p-2.5">
                        <Text className="font-sans-bold text-sm">{d.label}</Text>
                        <Text variant="caption" numberOfLines={1} className="text-muted mb-2">
                          {d.slot.title ?? '상품 정보 없음'}
                        </Text>
                        {/* 사이즈 선택 버튼 */}
                        <Pressable
                          onPress={() => setSizeSheetCat(d.category)}
                          className={cn(
                            'flex-row items-center justify-between rounded-lg px-3 py-2 border',
                            hasSize ? 'bg-primary/10 border-primary' : 'bg-surface border-border',
                          )}
                        >
                          <Text
                            className={cn(
                              'font-sans-medium text-sm',
                              hasSize ? 'text-primary' : 'text-muted',
                            )}
                          >
                            {hasSize ? d.slot.selectedSize : '사이즈 선택'}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={hasSize ? '#3b82f6' : '#9ca3af'}
                          />
                        </Pressable>
                        {tooSmall ? (
                          <Text variant="caption" className="mt-1 text-red-500">
                            작아요
                            {fit && fit.recommendedSizes.length
                              ? ` · ${fit.recommendedSizes.join('/')} 가능`
                              : ''}
                          </Text>
                        ) : fit?.verdict === 'loose' ? (
                          <Text variant="caption" className="mt-1 text-amber-600">
                            넉넉한 핏
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 신체 치수 수정하기 */}
            <Pressable onPress={() => setBodySheetOpen(true)} className="items-center py-3 mt-1">
              <Text className="text-primary font-sans-bold">신체 치수 수정하기</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {done.length > 0 && (
        <View
          className="px-4 pt-3 border-t border-border"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Pressable onPress={handleGenerate} className="bg-primary py-4 rounded-xl items-center">
            <Text className="text-white font-sans-bold text-base">생성</Text>
          </Pressable>
        </View>
      )}

      {/* 사이즈 선택 바텀시트 */}
      <SizeSelectSheet
        visible={sizeSheetCat !== null}
        productTitle={sizeSheetSlot?.title}
        category={sizeSheetCat ?? undefined}
        options={sizeSheetSlot?.sizeOptions ?? []}
        sizeTable={sizeSheetSlot?.sizeTable}
        sizeTableSource={sizeSheetSlot?.sizeTableSource}
        selected={sizeSheetSlot?.selectedSize}
        onClose={() => setSizeSheetCat(null)}
        onSubmit={(label) => {
          if (sizeSheetCat) setSlotSize(sizeSheetCat, label);
          setSizeSheetCat(null);
        }}
      />

      {/* 신체 치수 수정 바텀시트 (실제 저장은 프로필 담당 — 지금은 상세 이동만 연결) */}
      <BodyMeasureSheet
        visible={bodySheetOpen}
        initialHeight={MOCK_USER.height}
        initialWeight={MOCK_USER.weight}
        onClose={() => setBodySheetOpen(false)}
        onSave={() => setBodySheetOpen(false)}
        onGoDetail={() => {
          setBodySheetOpen(false);
          router.push('/(tabs)/profile/body');
        }}
      />
    </ScreenShell>
  );
}
