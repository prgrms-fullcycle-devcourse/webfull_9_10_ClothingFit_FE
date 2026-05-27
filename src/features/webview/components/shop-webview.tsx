import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { Text } from '@/components/ui/text';

export type ShopWebViewHandle = {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  injectJavaScript: (script: string) => void;
};

type ShopWebViewProps = {
  /** WebView가 처음 로드할 URL (몰의 home 주소) */
  uri: string;
  /** 현재 URL이 바뀔 때마다 호출됨 (URL 바 동기화용) */
  onUrlChange?: (url: string, canGoBack: boolean) => void;
  /** inject 스크립트에서 postMessage 보낸 결과 수신 */
  onScrapeMessage?: (raw: string) => void;
  /** 페이지 로드 시작/종료 시 호출 (스피너 외 추가 UX 필요할 때) */
  onLoadingChange?: (loading: boolean) => void;
};

const MOBILE_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export const ShopWebView = forwardRef<ShopWebViewHandle, ShopWebViewProps>(function ShopWebView(
  { uri, onUrlChange, onScrapeMessage, onLoadingChange },
  ref,
) {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    goBack: () => webRef.current?.goBack(),
    goForward: () => webRef.current?.goForward(),
    reload: () => webRef.current?.reload(),
    injectJavaScript: (script: string) => webRef.current?.injectJavaScript(script),
  }));

  const handleNavStateChange = (e: WebViewNavigation) => {
    onUrlChange?.(e.url, e.canGoBack);
  };

  const handleMessage = (e: WebViewMessageEvent) => {
    onScrapeMessage?.(e.nativeEvent.data);
  };

  return (
    <View className="flex-1 bg-white">
      <WebView
        ref={webRef}
        source={{ uri }}
        userAgent={MOBILE_USER_AGENT}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        originWhitelist={['*']}
        startInLoadingState={false}
        setSupportMultipleWindows={false}
        onNavigationStateChange={handleNavStateChange}
        onMessage={handleMessage}
        onLoadStart={() => {
          setLoading(true);
          setError(null);
          onLoadingChange?.(true);
        }}
        onLoadEnd={() => {
          setLoading(false);
          onLoadingChange?.(false);
        }}
        onError={(e) => {
          setError(e.nativeEvent.description ?? '페이지를 불러올 수 없어요');
          setLoading(false);
          onLoadingChange?.(false);
        }}
        onHttpError={(e) => {
          const status = e.nativeEvent.statusCode;
          if (status >= 400) {
            setError(`HTTP ${status} — 페이지 응답이 올바르지 않아요`);
          }
        }}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View className="absolute inset-0 items-center justify-center bg-white/95 px-6">
          <Text variant="subtitle" className="text-center">
            불러오기 실패
          </Text>
          <Text variant="caption" className="text-center mt-2">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
});
