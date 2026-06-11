import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, PanResponder, Pressable, Vibration, View } from 'react-native';

const ACTION_WIDTH = 72;

/**
 * 좌측으로 스와이프하거나 꾹 누르면(long-press) 콘텐츠가 옆으로 밀리며 우측에 휴지통 버튼이
 * 드러나는 행(인스타그램식). react-native-gesture-handler 없이 RN 기본 PanResponder/Animated로
 * 구현해 네이티브 의존성이 없다.
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

  const snap = (toOpen: boolean) => {
    if (toOpen && !openRef.current) Vibration.vibrate(15); // 휴지통 노출되는 순간 짧은 진동
    openRef.current = toOpen;
    Animated.spring(translateX, {
      toValue: toOpen ? -ACTION_WIDTH : 0,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
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
    <View className="mb-2">
      {/* 뒤에 깔린 삭제 버튼 */}
      <View
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: ACTION_WIDTH }}
        className="items-center justify-center rounded-xl bg-red-500"
      >
        <Pressable
          onPress={() => {
            snap(false);
            onDelete();
          }}
          hitSlop={8}
          style={{ flex: 1, width: ACTION_WIDTH, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="trash" size={22} color="#fff" />
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
