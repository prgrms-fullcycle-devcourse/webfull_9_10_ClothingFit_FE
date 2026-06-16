import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { width: number; height: number };

/**
 * 이미지의 실제 픽셀 사이즈를 비동기로 측정.
 * RN의 Image.getSize는 콜백 기반 → Promise로 감쌈.
 */
export function getImagePixelSize(uri: string): Promise<Size> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err instanceof Error ? err : new Error(String(err))),
    );
  });
}

/**
 * container(=Image 컴포넌트의 box) 좌표를 원본 이미지 픽셀 좌표로 변환.
 * resizeMode="contain" 기준: 이미지는 비율 유지하면서 안에 letterbox로 들어감.
 */
export function containerRectToImagePixels(rect: Rect, container: Size, imagePx: Size): Rect {
  // 0 크기(측정 실패/깨진 이미지)면 division-by-zero·NaN 방지 위해 원본 rect 그대로
  if (
    container.width === 0 ||
    container.height === 0 ||
    imagePx.width === 0 ||
    imagePx.height === 0
  ) {
    return rect;
  }

  const containerRatio = container.width / container.height;
  const imageRatio = imagePx.width / imagePx.height;

  let renderedW: number;
  let renderedH: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > containerRatio) {
    // 이미지가 더 가로로 길다 → 좌우 꽉, 위/아래 letterbox
    renderedW = container.width;
    renderedH = container.width / imageRatio;
    offsetY = (container.height - renderedH) / 2;
  } else {
    // 이미지가 더 세로 → 위아래 꽉, 좌우 letterbox
    renderedH = container.height;
    renderedW = container.height * imageRatio;
    offsetX = (container.width - renderedW) / 2;
  }

  const scale = imagePx.width / renderedW; // == imagePx.height / renderedH

  // letterbox 영역 안으로 클램프. relX/relY는 [0, rendered] 범위로 가두고,
  // 폭/높이는 남은 영역을 넘지 않게 + 음수가 되지 않게(out-of-bounds crop 방지).
  const relX = Math.min(Math.max(0, rect.x - offsetX), renderedW);
  const relY = Math.min(Math.max(0, rect.y - offsetY), renderedH);
  const relW = Math.max(0, Math.min(renderedW - relX, rect.w));
  const relH = Math.max(0, Math.min(renderedH - relY, rect.h));

  return {
    x: Math.round(relX * scale),
    y: Math.round(relY * scale),
    w: Math.round(relW * scale),
    h: Math.round(relH * scale),
  };
}

/**
 * 실제 자르기. expo-image-manipulator는 crop을 픽셀 단위로 받음.
 * 결과는 새 file:// uri.
 */
export async function cropImageAt(uri: string, rectPx: Rect): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        crop: {
          originX: rectPx.x,
          originY: rectPx.y,
          width: rectPx.w,
          height: rectPx.h,
        },
      },
    ],
    { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}
