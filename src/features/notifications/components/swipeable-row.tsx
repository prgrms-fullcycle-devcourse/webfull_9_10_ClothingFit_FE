import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, PanResponder, Pressable, Vibration, View } from 'react-native';

const ACTION_WIDTH = 72;

// 현재 열려있는 행을 닫는 함수(전역). 새 행을 열거나 화면을 떠날 때 이전 행을 닫는다.
let activeClose: (() => void) | null = null;

/** 화면을 떠날 때 등 열려있는 스와이프를 닫는다. */
export function closeActiveSwipe() {
  activeClose?.();
  activeClose = null;
}

/**
 * 좌측으로 스와이프하거나 꾹 누르면(long-press) 콘텐츠가 옆으로 밀리며 우측에 휴지통 버튼이
 * 드러나는 행(인스타그램식). react-native-gesture-handler 없이 RN 기본 PanResponder/Animated로
 * 구현해 네이티브 의존성이 없다.
 * 한 번에 한 행만 열린다(다른 행을 열면 이전 행이 자동으로 닫힘).
 */
export function SwipeableRow({
  children,
  onPress,
  onDelete,
  className,
}: {
  children: ReactNode;
  onPress?: () => void;
  onDelete: () => void;
  className?: string;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);

  // 이 행을 닫는 함수 (안정적 참조 — 전역 activeClose 비교/등록용)
  const closeSelf = useRef(() => {
    openRef.current = false;
    Animated.spring(translateX, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
  }).current;

  const snap = (toOpen: boolean) => {
    if (toOpen) {
      // 다른 행이 열려있으면 먼저 닫기 (오른쪽으로 자연스럽게 복귀)
      if (activeClose && activeClose !== closeSelf) activeClose();
      if (!openRef.current) Vibration.vibrate(15); // 휴지통 노출 순간 짧은 진동
      openRef.current = true;
      activeClose = closeSelf;
      Animated.spring(translateX, {
        toValue: -ACTION_WIDTH,
        useNativeDriver: false,
        bounciness: 0,
      }).start();
    } else {
      closeSelf();
      if (activeClose === closeSelf) activeClose = null;
    }
  };

  const pan = useRef(
    PanResponder.create({
      // 가로 이동이 세로보다 충분히 클 때만 스와이프로 인식 (FlatList 세로 스크롤과 구분)
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => {
        const base = openRef.current ? -ACTION_WIDTH : 0;
        translateX.setValue(Math.min(0, Math.max(-ACTION_WIDTH, base + g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        const base = openRef.current ? -ACTION_WIDTH : 0;
        snap(base + g.dx < -ACTION_WIDTH / 2);
      },
    }),
  ).current;

  return (
    <View className="mb-1.5">
      {/* 뒤에 깔린 삭제 버튼 — 둥근 사각 + 주변 여백 (피그마 스타일) */}
      <View
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_WIDTH }}
        className="items-center justify-center"
      >
        <Pressable
          onPress={() => {
            snap(false);
            onDelete();
          }}
          hitSlop={8}
          className="h-14 w-14 items-center justify-center rounded-2xl bg-red-500"
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* 스와이프/롱프레스로 밀리는 콘텐츠 */}
      <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
        <Pressable
          onPress={() => (openRef.current ? snap(false) : onPress?.())}
          onLongPress={() => snap(true)} // 꾹 누르면 휴지통 노출
          delayLongPress={250}
          className={className}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
}
