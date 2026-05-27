import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

import { ClothingCropCanvas } from '../components/clothing-crop-canvas';
import { SizePickerModal } from '../components/size-picker-modal';
import { Toast } from '../components/toast';
import { CATEGORIES } from '../constants/categories';
import { useCopySession } from '../hooks/use-copy-session';
import type { ScrapeProductData } from '../inject/protocol';
import { getDontShowNoSizeAlert, setDontShowNoSizeAlert } from '../storage/preferences';
import {
  getPendingScrape,
  looseCategoryFit,
  setPendingScrape,
} from '../store/pending-scrape-store';
import {
  containerRectToImagePixels,
  cropImageAt,
  getImagePixelSize,
  type Rect,
} from '../utils/crop-image';

export function ClothingCropScreen() {
  const { saveSlot } = useCopySession();
  const pending = getPendingScrape();

  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sizePickerData, setSizePickerData] = useState<ScrapeProductData | null>(null);

  // 캔버스에서 받아오는 최신 크롭 영역
  const cropRectRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!pending) router.back();
  }, [pending]);

  if (!pending) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        <Text className="text-white text-center mt-10 font-sans">로딩 중…</Text>
      </SafeAreaView>
    );
  }

  const categoryLabel =
    CATEGORIES.find((c) => c.id === pending.category)?.label ?? pending.category;

  const close = () => {
    setPendingScrape(null);
    router.back();
  };

  /** 실제 크롭 + 저장 */
  const cropAndSave = async (
    data: ScrapeProductData | null,
    sizeName: string | null,
    measurements: Record<string, number> | undefined,
  ) => {
    try {
      // 1) 원본 이미지 픽셀 사이즈
      const imgPx = await getImagePixelSize(pending.capturedUri);

      // 2) container 좌표 → 이미지 픽셀 좌표
      const pxRect = containerRectToImagePixels(
        cropRectRef.current,
        containerSizeRef.current,
        imgPx,
      );

      // 3) 너무 작거나 invalid 하면 원본 사용
      let finalUri = pending.capturedUri;
      if (pxRect.w >= 16 && pxRect.h >= 16) {
        finalUri = await cropImageAt(pending.capturedUri, pxRect);
      }

      saveSlot(pending.category, {
        imageUri: finalUri,
        measurements,
        sourceUrl: data?.url,
      });
      setPendingScrape(null);
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장 실패';
      Alert.alert('저장 실패', msg);
      setSubmitting(false);
    }
  };

  /** 사이즈표 없음 → alert */
  const showNoSizeAlertOrSave = async (data: ScrapeProductData) => {
    const dontShow = await getDontShowNoSizeAlert();
    if (dontShow) return cropAndSave(data, null, undefined);

    Alert.alert(
      '사이즈 표가 제공되지 않는 상품이에요',
      '해당 이미지로 진행할까요?\n실제 착용감과 다를 수 있어요.',
      [
        { text: '취소', style: 'cancel', onPress: () => setSubmitting(false) },
        {
          text: '다시 보지 않기',
          onPress: async () => {
            await setDontShowNoSizeAlert(true);
            await cropAndSave(data, null, undefined);
          },
        },
        { text: '확인', onPress: () => cropAndSave(data, null, undefined) },
      ],
    );
  };

  const handleDone = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const data = await pending.scrapePromise;

      // 카테고리 부적합 휴리스틱
      if (!looseCategoryFit(pending.category, data.title)) {
        setToast('의류 핏 영역이 올바르지 않습니다.\n다른 이미지로 다시 시도해 주세요.');
        setTimeout(() => {
          setPendingScrape(null);
          router.back();
        }, 1800);
        return;
      }

      if (!data.sizeTable || Object.keys(data.sizeTable).length === 0) {
        await showNoSizeAlertOrSave(data);
      } else if (Object.keys(data.sizeTable).length === 1) {
        // 사이즈 하나뿐이면 자동 선택
        const onlyKey = Object.keys(data.sizeTable)[0];
        await cropAndSave(data, onlyKey, data.sizeTable[onlyKey]);
      } else {
        // 여러 사이즈 → picker
        setSizePickerData(data);
        // submitting은 유지 (picker가 처리)
      }
    } catch {
      Alert.alert('상품 정보를 불러오지 못했어요', '캡처한 이미지로만 진행할까요?', [
        { text: '취소', style: 'cancel', onPress: () => setSubmitting(false) },
        { text: '진행', onPress: () => cropAndSave(null, null, undefined) },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={close} hitSlop={8} className="w-9 h-9 items-center justify-center">
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text className="text-white font-sans-bold">의류 영역 선택 · {categoryLabel}</Text>
        <Pressable onPress={handleDone} hitSlop={8} disabled={submitting} className="px-3 py-1.5">
          {submitting ? (
            <ActivityIndicator color="#60a5fa" />
          ) : (
            <Text className="font-sans-bold text-accent">완료</Text>
          )}
        </Pressable>
      </View>

      <ClothingCropCanvas
        imageUri={pending.capturedUri}
        onChange={(r, container) => {
          cropRectRef.current = r;
          containerSizeRef.current = container;
        }}
      />

      <View className="px-4 py-3">
        <Text className="text-white/80 text-xs text-center font-sans">
          모서리를 드래그해서 의류 영역을 맞춰주세요
        </Text>
      </View>

      <SizePickerModal
        visible={!!sizePickerData}
        sizeTable={sizePickerData?.sizeTable ?? {}}
        onCancel={() => {
          setSizePickerData(null);
          setSubmitting(false);
        }}
        onPick={async (sizeName, measurements) => {
          const data = sizePickerData;
          setSizePickerData(null);
          if (data) await cropAndSave(data, sizeName, measurements);
        }}
      />

      <Toast message={toast ?? ''} visible={!!toast} onHide={() => setToast(null)} />
    </SafeAreaView>
  );
}
