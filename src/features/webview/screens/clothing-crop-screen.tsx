import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

import type { SizeTable } from '../api/musinsa-size-api';
import { ClothingCropCanvas } from '../components/clothing-crop-canvas';
import { ScanOverlay } from '../components/scan-overlay';
import { Toast } from '../components/toast';
import { CATEGORIES } from '../constants/categories';
import { useCopySession } from '../hooks/use-copy-session';
import type { ScrapeProductData } from '../inject/protocol';
import { getPendingScrape, setPendingScrape } from '../store/pending-scrape-store';
import type { SizeOption, SizeTableSource } from '../types/copy-session';
import { analyzeSize, type SizeAnalysis } from '../utils/analyze-size';
import {
  containerRectToImagePixels,
  cropImageAt,
  getImagePixelSize,
  type Rect,
} from '../utils/crop-image';

export function ClothingCropScreen() {
  const { saveSlot } = useCopySession();
  // 마운트 시점에 한 번만 고정. 저장 중 setPendingScrape(null)로 리렌더돼도
  // 가드 effect가 다시 터져서 router.back()이 중복 호출되는 걸 막는다.
  const [pending] = useState(() => getPendingScrape());

  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // "완료"를 눌렀는데 분석이 아직 안 끝나 대기 중인지 (오버레이 표시용)
  const [waitingAnalysis, setWaitingAnalysis] = useState(false);

  // 캔버스에서 받아오는 최신 크롭 영역
  const cropRectRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // 사이즈 분석을 화면 진입 즉시 백그라운드로 시작한다.
  // 사용자가 크롭 영역을 맞추는 동안 스크래핑·OCR이 돌아가서, "완료" 시점엔
  // 대개 이미 끝나있다(아직이면 그때만 잠깐 대기). 마운트 시 1회만 생성.
  const analysisRef = useRef<Promise<SizeAnalysis> | null>(null);
  if (pending && !analysisRef.current) {
    analysisRef.current = analyzeSize(pending.scrapePromise, pending.category);
    analysisRef.current.catch(() => {}); // unhandled rejection 경고 방지 (실제 처리는 handleDone)
  }

  useEffect(() => {
    if (!pending) router.back();
    // 마운트 시 1회만 체크 (pending은 고정값)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /**
   * 실제 크롭 + 저장.
   * 사이즈 선택은 최종 확인(confirm) 화면에서 하므로, 여기선 구매 가능한
   * 사이즈 옵션 목록만 저장한다.
   */
  const cropAndSave = async (
    data: ScrapeProductData | null,
    sizeOptions: SizeOption[] = [],
    sizeTable?: SizeTable,
    sizeTableSource?: SizeTableSource,
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
        title: data?.title,
        brand: data?.brand,
        productName: data?.name,
        sizeOptions: sizeOptions.length ? sizeOptions : undefined,
        sizeTable,
        sizeTableSource,
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

  const handleDone = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 진입 시 시작해둔 분석을 기다린다. 대개 이미 끝나있고(대기 0),
      // 아직이면 "분석 마무리 중" 오버레이를 띄운 채 잠깐 기다린다.
      setWaitingAnalysis(true);
      const result = await analysisRef.current!;
      setWaitingAnalysis(false);

      // 카테고리 부적합 → 안내 후 복귀
      if (result.categoryMismatch) {
        setToast('선택한 카테고리와 상품이 맞지 않아요.\n다른 카테고리로 다시 COPY해 주세요.');
        setTimeout(() => {
          setPendingScrape(null);
          router.back();
        }, 1800);
        return;
      }

      // 사이즈를 못 읽었으면(가방·양말 등 사이즈 없는 상품) 저장하지 않는다.
      // 5개 카테고리(모자/아웃터/상의/하의/신발)의 사이즈 데이터가 없는 상품은
      // 이 앱에서 다루지 않으므로, 빈손으로 담지 말고 안내 후 복귀.
      const hasSize = !!result.sizeTable && Object.keys(result.sizeTable).length > 0;
      if (!hasSize) {
        setSubmitting(false);
        Alert.alert(
          '사이즈 정보를 인식할 수 없어요',
          '이 상품은 사이즈 정보가 없어 추가할 수 없어요.\n모자·아우터·상의·하의·신발 상품을 COPY해 주세요.',
          [
            {
              text: '확인',
              onPress: () => {
                setPendingScrape(null);
                router.back();
              },
            },
          ],
        );
        return;
      }

      await cropAndSave(result.data, result.sizeOptions, result.sizeTable, result.sizeTableSource);
    } catch {
      setWaitingAnalysis(false);
      Alert.alert(
        '상품 정보를 불러오는 데 시간이 걸려요',
        '사이즈 정보 없이 캡처한 이미지로만 진행할까요?',
        [
          { text: '취소', style: 'cancel', onPress: () => setSubmitting(false) },
          { text: '진행', onPress: () => cropAndSave(null) },
        ],
      );
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

      <Toast message={toast ?? ''} visible={!!toast} onHide={() => setToast(null)} />

      {/* "완료"를 눌렀는데 분석이 아직 안 끝났을 때만 표시 (게이지+문구 자동) */}
      <ScanOverlay visible={waitingAnalysis} />
    </SafeAreaView>
  );
}
