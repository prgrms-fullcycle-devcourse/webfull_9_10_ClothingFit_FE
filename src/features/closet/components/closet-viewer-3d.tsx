import { useMemo } from 'react';
import { WebView } from 'react-native-webview';

type Props = { modelUrl: string };

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
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #ffffff; overflow: hidden; }
  model-viewer { width: 100%; height: 100%; --poster-color: #ffffff; }
</style>
</head>
<body>
<model-viewer
  src="${modelUrl}"
  camera-controls
  interaction-prompt="none"
  shadow-intensity="1"
  exposure="1"
  environment-image="neutral"
></model-viewer>
</body>
</html>`;
}

export function ClosetViewer3D({ modelUrl }: Props) {
  const html = useMemo(() => buildHtml(modelUrl), [modelUrl]);
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html, baseUrl: `${originOf(modelUrl)}/` }}
      style={{ flex: 1, backgroundColor: '#fff' }}
      javaScriptEnabled
      domStorageEnabled
      androidLayerType="hardware"
    />
  );
}
