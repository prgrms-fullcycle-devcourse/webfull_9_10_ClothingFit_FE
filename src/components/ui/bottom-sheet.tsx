import { useEffect } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useSharedValue(600);
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 600, { duration: 250 });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1">
        <View className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={onClose} />
        </View>
        <Animated.View
          style={[sheetStyle, { paddingBottom: bottom }]}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
