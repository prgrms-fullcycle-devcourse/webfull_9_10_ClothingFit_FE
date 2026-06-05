import { useRef, useState } from 'react';
import { Image, PanResponder, View, type LayoutChangeEvent } from 'react-native';

type Rect = { x: number; y: number; w: number; h: number };
type Corner = 'tl' | 'tr' | 'bl' | 'br';

type Props = {
  imageUri: string;
  /** 0~1 범위 초기 크롭 영역, 기본은 중앙 60% */
  initialFraction?: Rect;
  onChange?: (rect: Rect, container: { width: number; height: number }) => void;
};

const HANDLE = 28; // 모서리 핸들 시각 크기
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 }; // 터치 여유 (잡기 쉽게)
const MIN_SIZE = 40;

export function ClothingCropCanvas({
  imageUri,
  initialFraction = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 },
  onChange,
}: Props) {
  const [container, setContainer] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });

  // 제스처 핸들러에서 읽을 최신 값들 (리렌더와 무관하게 항상 최신)
  const containerRef = useRef({ w: 0, h: 0 });
  const rectRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const startRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const initRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const clamp = (r: Rect): Rect => {
    const c = containerRef.current;
    let { x, y, w, h } = r;
    w = Math.max(MIN_SIZE, Math.min(w, c.w));
    h = Math.max(MIN_SIZE, Math.min(h, c.h));
    x = Math.max(0, Math.min(x, c.w - w));
    y = Math.max(0, Math.min(y, c.h - h));
    return { x, y, w, h };
  };

  const applyRect = (r: Rect) => {
    const next = clamp(r);
    rectRef.current = next;
    setRect(next);
    onChangeRef.current?.(next, { width: containerRef.current.w, height: containerRef.current.h });
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    containerRef.current = { w: width, h: height };
    setContainer({ w: width, h: height });
    if (!initRef.current && width > 0 && height > 0) {
      initRef.current = true;
      applyRect({
        x: initialFraction.x * width,
        y: initialFraction.y * height,
        w: initialFraction.w * width,
        h: initialFraction.h * height,
      });
    }
  };

  // ⚠️ PanResponder는 컴포넌트 수명 동안 "한 번만" 생성한다.
  // 매 렌더마다 다시 만들면 (New Architecture에서) 진행 중인 터치를 놓쳐 드래그가 멈춘다.
  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = rectRef.current;
      },
      onPanResponderMove: (_, g) => {
        applyRect({
          ...startRef.current,
          x: startRef.current.x + g.dx,
          y: startRef.current.y + g.dy,
        });
      },
    }),
  ).current;

  const makeResizeResponder = (corner: Corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = rectRef.current;
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
        } else {
          w += g.dx;
          h += g.dy;
        }
        applyRect({ x, y, w, h });
      },
    });

  const resizeResponders = useRef<Record<Corner, ReturnType<typeof PanResponder.create>>>({
    tl: makeResizeResponder('tl'),
    tr: makeResizeResponder('tr'),
    bl: makeResizeResponder('bl'),
    br: makeResizeResponder('br'),
  }).current;

  const corners: { key: Corner; style: object }[] = [
    { key: 'tl', style: { left: rect.x - HANDLE / 2, top: rect.y - HANDLE / 2 } },
    { key: 'tr', style: { left: rect.x + rect.w - HANDLE / 2, top: rect.y - HANDLE / 2 } },
    { key: 'bl', style: { left: rect.x - HANDLE / 2, top: rect.y + rect.h - HANDLE / 2 } },
    { key: 'br', style: { left: rect.x + rect.w - HANDLE / 2, top: rect.y + rect.h - HANDLE / 2 } },
  ];

  return (
    <View className="flex-1 bg-black" onLayout={handleLayout}>
      <Image source={{ uri: imageUri }} style={{ flex: 1 }} resizeMode="contain" />

      {/* 4개의 darken 마스크로 외곽을 어둡게 */}
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

          {/* 크롭 사각형 (안쪽 드래그 → 이동) */}
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

          {/* 모서리 핸들 (드래그 → 크기 조절) */}
          {corners.map(({ key, style }) => (
            <View
              key={key}
              {...resizeResponders[key].panHandlers}
              hitSlop={HIT_SLOP}
              style={{
                position: 'absolute',
                width: HANDLE,
                height: HANDLE,
                backgroundColor: '#2563eb',
                borderWidth: 2,
                borderColor: '#fff',
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
