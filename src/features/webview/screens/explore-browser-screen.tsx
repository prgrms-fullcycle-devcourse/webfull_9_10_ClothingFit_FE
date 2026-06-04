import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

import { CategorySidebar } from '../components/category-sidebar';
import { MallDropdown } from '../components/mall-dropdown';
import { ScanSpinnerOverlay } from '../components/scan-spinner-overlay';
import { ShopWebView, type ShopWebViewHandle } from '../components/shop-webview';
import { Toast } from '../components/toast';
import type { CategoryId } from '../constants/categories';
import { getMall, isScrapeSupported, type MallId } from '../constants/malls';
import { useCopySession } from '../hooks/use-copy-session';
import { handleScrapeWebViewMessage, startScrape } from '../hooks/use-scrape';
import { useWebViewCapture } from '../hooks/use-webview-capture';
import { setPendingScrape } from '../store/pending-scrape-store';

export function ExploreBrowserScreen() {
  const {
    session,
    canGenerate,
    selectCategory,
    clearCategory,
    toggleSidebar,
    setSidebarVisible,
    toggleDeleteMode,
    changeMall,
  } = useCopySession('musinsa');

  const webRef = useRef<ShopWebViewHandle>(null);
  const captureContainerRef = useRef<View>(null);
  const { capture } = useWebViewCapture();

  const mall = getMall(session.mallId);
  const [currentUrl, setCurrentUrl] = useState(mall.mobileHomeUrl ?? mall.homeUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleMallSelect = (mallId: MallId) => {
    if (mallId === session.mallId) return;
    changeMall(mallId);
    const next = getMall(mallId);
    setCurrentUrl(next.mobileHomeUrl ?? next.homeUrl);
  };

  const handleCategoryPress = (categoryId: CategoryId) => {
    const slot = session.slots[categoryId];
    if (session.deleteMode) {
      // 삭제 모드에선 연속 삭제를 위해 사이드바를 열어둔다
      if (slot.status === 'done') clearCategory(categoryId);
      return;
    }
    selectCategory(categoryId);
    // 카테고리 선택 시 사이드바 자동 닫기 (선택 후 바로 캡처하기 편하게)
    setSidebarVisible(false);
  };

  const handleCopyPress = useCallback(async () => {
    if (busy) return;
    if (!session.activeCategory) {
      Alert.alert('카테고리 선택 필요', '우측 사이드바에서 캡처할 카테고리를 먼저 선택해 주세요.');
      return;
    }
    if (!isScrapeSupported(session.mallId)) {
      setToast('이 쇼핑몰은 COPY·스크래핑 준비 중이에요.');
      return;
    }

    setBusy(true);

    // 1) 사이드바 접어 UX 피드백 (캡처에는 어차피 안 들어가지만 시각적 정돈)
    const wasSidebarVisible = session.sidebarVisible;
    if (wasSidebarVisible) setSidebarVisible(false);

    // 2) WebView 캡처 (PNG file:// URI) — 다음 frame까지 살짝 대기해서 사이드바 fold animation 반영
    await new Promise((r) => setTimeout(r, 60));
    const capturedUri = await capture(captureContainerRef);
    if (wasSidebarVisible) setSidebarVisible(true);
    if (!capturedUri) {
      setBusy(false);
      setToast('캡처에 실패했어요. 다시 시도해 주세요.');
      return;
    }

    // 2) 스크래핑 시작.
    //    ⚠️ crop 화면으로 router.push 하면 이 WebView가 백그라운드로 가면서
    //    JS 타이머(setInterval)가 throttle 되어 inject 폴링이 수십 초로 늘어진다.
    //    그래서 WebView가 아직 포그라운드인 "지금" 스크래핑이 끝나길 기다린 뒤
    //    crop으로 이동한다. (resolve/ reject 모두 그대로 crop에 전달)
    const scrapePromise = startScrape({
      mallId: session.mallId,
      inject: (script) => webRef.current?.injectJavaScript(script),
      timeoutMs: 15000,
    });
    // reject로 인한 unhandled rejection 경고 방지 (실제 처리는 crop에서)
    scrapePromise.catch(() => {});

    // 3) WebView가 살아있는 동안 스크래핑 완료를 기다린다 (throttle 회피)
    await scrapePromise.catch(() => undefined);

    // 4) pending store에 컨텍스트 저장 + crop으로 이동
    setPendingScrape({
      category: session.activeCategory,
      capturedUri,
      status: 'pending',
      scrapePromise,
    });

    setBusy(false);
    router.push('/(tabs)/explore/crop');
  }, [
    busy,
    session.activeCategory,
    session.mallId,
    session.sidebarVisible,
    capture,
    setSidebarVisible,
  ]);

  const handleGenerate = () => {
    if (!canGenerate) {
      setToast('모자·아우터·상의·하의·신발 중 최소 1개를 채워주세요.');
      return;
    }
    router.push('/(tabs)/fitting/confirm');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center gap-2 px-3 py-2 border-b border-border bg-white">
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          hitSlop={8}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="close" size={22} color="#111827" />
        </Pressable>
        <MallDropdown activeMallId={session.mallId} onSelect={handleMallSelect} />
        <Pressable
          onPress={() => canGoBack && webRef.current?.goBack()}
          hitSlop={6}
          className="w-8 h-8 items-center justify-center"
          disabled={!canGoBack}
        >
          <Ionicons name="chevron-back" size={20} color={canGoBack ? '#111827' : '#d1d5db'} />
        </Pressable>
        <View className="flex-1 bg-gray-100 rounded-full px-3 py-1.5">
          <Text variant="caption" numberOfLines={1} className="text-gray-700">
            {currentUrl}
          </Text>
        </View>
        <Pressable
          onPress={() => webRef.current?.reload()}
          hitSlop={8}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="refresh" size={18} color="#111827" />
        </Pressable>
      </View>

      {/* 캡처 대상 영역: 사이드바를 포함하면 캡처본에 같이 찍히므로 WebView만 감싼다 */}
      <View className="flex-1">
        <View ref={captureContainerRef} collapsable={false} className="flex-1">
          <ShopWebView
            key={session.mallId}
            ref={webRef}
            uri={mall.mobileHomeUrl ?? mall.homeUrl}
            onUrlChange={(url, back) => {
              setCurrentUrl(url);
              setCanGoBack(back);
            }}
            onScrapeMessage={handleScrapeWebViewMessage}
          />
        </View>

        <CategorySidebar
          session={session}
          onToggle={toggleSidebar}
          onCategoryPress={handleCategoryPress}
          onGenerate={handleGenerate}
          canGenerate={canGenerate}
        />
      </View>

      <Toast message={toast ?? ''} visible={!!toast} onHide={() => setToast(null)} />

      {/* COPY 직후 스크래핑 동안 보여주는 로딩 오버레이 (동글동글 스피너 + 순환 문구) */}
      <ScanSpinnerOverlay visible={busy} />

      <SafeAreaView edges={['bottom']} className="bg-white border-t border-border">
        <View className="flex-row gap-2 px-3 py-2">
          <Pressable
            onPress={handleCopyPress}
            disabled={!session.activeCategory || busy || !isScrapeSupported(session.mallId)}
            className={cn(
              'flex-1 h-12 rounded-xl items-center justify-center',
              session.activeCategory && !busy && isScrapeSupported(session.mallId)
                ? 'bg-primary'
                : 'bg-gray-300',
            )}
          >
            <Text className="text-white font-sans-bold tracking-widest">
              {busy ? '캡처 중…' : 'COPY'}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleDeleteMode}
            className={cn(
              'flex-1 h-12 rounded-xl items-center justify-center border-2',
              session.deleteMode ? 'bg-red-500 border-red-500' : 'bg-white border-primary',
            )}
          >
            <Text
              className={cn('font-sans-bold', session.deleteMode ? 'text-white' : 'text-primary')}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
