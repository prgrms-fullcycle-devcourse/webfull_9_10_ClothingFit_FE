import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Text } from '@/components/ui/text';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  /** ms */
  duration?: number;
};

export function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();

    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) onHide();
        },
      );
    }, duration);

    return () => clearTimeout(t);
  }, [visible, duration, onHide, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{ opacity }}
      className="absolute top-4 left-4 right-4 z-50"
    >
      <View className="flex-row items-center gap-2 bg-neutral-900/95 rounded-xl px-4 py-3 shadow-lg">
        <Ionicons name="alert-circle" size={18} color="#fbbf24" />
        <Text className="text-white text-sm flex-1 font-sans">{message}</Text>
      </View>
    </Animated.View>
  );
}
