import { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, View, type LayoutChangeEvent } from 'react-native';

type Rect = { x: number; y: number; w: number; h: number };

type Props = {
  imageUri: string;
  /** 외부에서 현재 크롭 영역을 읽고 싶으면 ref.current?.getRect() */
  initialFraction?: Rect; // 0~1 범위, 기본은 중앙 60%
  onChange?: (rect: Rect, container: { width: number; height: number }) => void;
};

const HANDLE = 24; // 모서리 핸들 hit-size (시각적 크기 + hit slop)
const MIN_SIZE = 40;

export function ClothingCropCanvas({
  imageUri,
  initialFraction = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
  onChange,
}: Props) {
  const [container, setContainer] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const initRef = useRef(false);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ w: width, h: height });
    if (!initRef.current && width > 0 && height > 0) {
      const r = {
        x: initialFraction.x * width,
        y: initialFraction.y * height,
        w: initialFraction.w * width,
        h: initialFraction.h * height,
      };
      setRect(r);
      onChange?.(r, { width, height });
      initRef.current = true;
    }
  };

  const clamp = (r: Rect): Rect => {
    let { x, y, w, h } = r;
    w = Math.max(MIN_SIZE, Math.min(w, container.w));
    h = Math.max(MIN_SIZE, Math.min(h, container.h));
    x = Math.max(0, Math.min(x, container.w - w));
    y = Math.max(0, Math.min(y, container.h - h));
    return { x, y, w, h };
  };

  const startRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = rect;
        },
        onPanResponderMove: (_, g) => {
          const next = clamp({
            ...startRef.current,
            x: startRef.current.x + g.dx,
            y: startRef.current.y + g.dy,
          });
          setRect(next);
          onChange?.(next, { width: container.w, height: container.h });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect, container.w, container.h],
  );

  const resizeResponder = (corner: 'tl' | 'tr' | 'bl' | 'br') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = rect;
      },
      onPanResponderMove: (_, g) => {
        let { x, y, w, h } = startRef.current;
        if (corner === 'tl') {
          x += g.dx;
          y += g.dy;
          w -= g.dx;
          h -= g.dy;
        } else if (corner === 'tr') {
          y += g.dy;
          w += g.dx;
          h -= g.dy;
        } else if (corner === 'bl') {
          x += g.dx;
          w -= g.dx;
          h += g.dy;
        } else if (corner === 'br') {
          w += g.dx;
          h += g.dy;
        }
        const next = clamp({ x, y, w, h });
        setRect(next);
        onChange?.(next, { width: container.w, height: container.h });
      },
    });

  const corners: { key: 'tl' | 'tr' | 'bl' | 'br'; style: object }[] = [
    { key: 'tl', style: { left: rect.x - HANDLE / 2, top: rect.y - HANDLE / 2 } },
    { key: 'tr', style: { left: rect.x + rect.w - HANDLE / 2, top: rect.y - HANDLE / 2 } },
    { key: 'bl', style: { left: rect.x - HANDLE / 2, top: rect.y + rect.h - HANDLE / 2 } },
    { key: 'br', style: { left: rect.x + rect.w - HANDLE / 2, top: rect.y + rect.h - HANDLE / 2 } },
  ];

  return (
    <View className="flex-1 bg-black" onLayout={handleLayout}>
      <Image source={{ uri: imageUri }} style={{ flex: 1 }} resizeMode="contain" />

      {/* 4개의 darken 마스크로 외곽을 어둡게 (간단 구현) */}
      {container.w > 0 && (
        <>
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              height: rect.y,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            pointerEvents="none"
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: rect.y + rect.h,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            pointerEvents="none"
          />
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: rect.y,
              width: rect.x,
              height: rect.h,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            pointerEvents="none"
          />
          <View
            style={{
              position: 'absolute',
              left: rect.x + rect.w,
              top: rect.y,
              right: 0,
              height: rect.h,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            pointerEvents="none"
          />

          {/* 크롭 사각형 (드래그 가능) */}
          <View
            {...moveResponder.panHandlers}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              borderWidth: 2,
              borderColor: '#2563eb',
            }}
          />

          {/* 모서리 핸들 */}
          {corners.map(({ key, style }) => (
            <View
              key={key}
              {...resizeResponder(key).panHandlers}
              style={{
                position: 'absolute',
                width: HANDLE,
                height: HANDLE,
                backgroundColor: '#2563eb',
                borderRadius: HANDLE / 2,
                ...style,
              }}
            />
          ))}
        </>
      )}
    </View>
  );
}
