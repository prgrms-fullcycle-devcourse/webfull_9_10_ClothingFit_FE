import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useSharedValue(600);
  const keyboardHeight = useSharedValue(0);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 600, { duration: 250 });
  }, [visible, translateY]);

  // 키보드 프레임을 매 프레임 직접 추적 (worklet)
  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        keyboardHeight.value = e.height;
      },
    },
    [],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - keyboardHeight.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Pressable
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          onPress={onClose}
        />
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={[sheetStyle, { paddingBottom: bottom }]}
            className="bg-white rounded-t-2xl"
          >
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            {children}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
