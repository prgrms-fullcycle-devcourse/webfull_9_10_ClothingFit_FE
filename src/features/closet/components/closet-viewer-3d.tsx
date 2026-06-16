import { useMemo } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  modelUrl: string;
  /** 터치 시작/끝을 부모에게 알려 부모 ScrollView/FlatList의 스크롤을 잠글 수 있게 함 */
  onScrollLock?: (locked: boolean) => void;
};

/** modelUrl의 출처(scheme+host). WebView baseUrl로 써서 모델을 '같은 출처'로 fetch → CORS 회피. */
function originOf(url: string): string {
  return url.match(/^https?:\/\/[^/]+/)?.[0] ?? '';
}

/**
 * Google `<model-viewer>` 웹 컴포넌트로 glb 렌더링.
 *
 * expo-three(JS GLTF 파서)는 임베드 텍스처가 많은 실제 모델(수십 MB)에서 멈추고
 * three 인스턴스 충돌 문제가 있어, 검증된 model-viewer를 WebView로 띄운다.
 * 텍스처·조명·카메라·회전을 컴포넌트가 자동 처리한다.
 */
function buildHtml(modelUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #e6e6e6; overflow: hidden; }
  model-viewer { width: 100%; height: 100%; --poster-color: #e6e6e6; }
  #spinner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e6e6e6;
    pointer-events: none;
  }
  .ring {
    width: 48px;
    height: 48px;
    border: 4px solid #d1d5db;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<model-viewer
  src="${modelUrl}"
  camera-controls
  interaction-prompt="none"
  shadow-intensity="1"
  exposure="0.65"
  tone-mapping="neutral"
  environment-image="neutral"
  id="mv"
>
  <div slot="progress-bar"></div>
</model-viewer>
<div id="spinner"><div class="ring"></div></div>
<script>
  document.getElementById('mv').addEventListener('load', function() {
    document.getElementById('spinner').style.display = 'none';
  });
</script>
</body>
</html>`;
}

const INJECT_TOUCH = `
  (function() {
    function send(type) { window.ReactNativeWebView.postMessage(type); }
    document.addEventListener('touchstart', function() { send('lock'); }, { passive: true });
    document.addEventListener('touchend',   function() { send('unlock'); }, { passive: true });
    document.addEventListener('touchcancel',function() { send('unlock'); }, { passive: true });
  })();
  true;
`;

export function ClosetViewer3D({ modelUrl, onScrollLock }: Props) {
  const html = useMemo(() => buildHtml(modelUrl), [modelUrl]);
  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: `${originOf(modelUrl)}/` }}
        style={{ flex: 1, backgroundColor: '#fff' }}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        injectedJavaScriptBeforeContentLoaded={INJECT_TOUCH}
        onMessage={(e) => {
          onScrollLock?.(e.nativeEvent.data === 'lock');
        }}
      />
    </View>
  );
}
