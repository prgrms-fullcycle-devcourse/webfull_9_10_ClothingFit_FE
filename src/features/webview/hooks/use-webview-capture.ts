import { useCallback, useState } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

type CaptureState =
  | { status: 'idle' }
  | { status: 'capturing' }
  | { status: 'success'; uri: string; width: number; height: number }
  | { status: 'error'; message: string };

/**
 * WebView 영역을 PNG로 캡처해서 file:// URI로 돌려준다.
 * 캡처 대상 View ref는 외부에서 잡아서 넘긴다 (ShopWebView를 감싼 View).
 *
 * 시니어 노트
 * - `format: 'png'`는 무손실이지만 용량이 큼. 크롭 후 압축할거면 OK.
 * - `result: 'tmpfile'`는 file://… 임시 경로. 앱 종료 시 정리됨.
 * - WebView는 iOS/Android에서 GPU 합성되는 경우가 있어, 첫 호출 시
 *   드물게 빈 화면이 나올 수 있음. 한 번 retry 로직 포함.
 */
export function useWebViewCapture() {
  const [state, setState] = useState<CaptureState>({ status: 'idle' });

  const capture = useCallback(async (ref: React.RefObject<View | null>) => {
    if (!ref.current) {
      setState({ status: 'error', message: '캡처 대상이 준비되지 않았어요' });
      return null;
    }

    setState({ status: 'capturing' });

    const tryCapture = async () => {
      return captureRef(ref, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
    };

    try {
      let uri: string;
      try {
        uri = await tryCapture();
      } catch {
        // WebView GPU 합성 race → 짧게 대기 후 1회 retry
        await new Promise((r) => setTimeout(r, 120));
        uri = await tryCapture();
      }

      // 실제 width/height는 호출부에서 measure로 받는 게 더 정확
      // (view-shot은 size 반환 안 함)
      setState({ status: 'success', uri, width: 0, height: 0 });
      return uri;
    } catch (e) {
      const message = e instanceof Error ? e.message : '캡처 실패';
      setState({ status: 'error', message });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, capture, reset };
}
