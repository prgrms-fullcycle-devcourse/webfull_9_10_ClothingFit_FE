import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * 하단에서 올라오는 공통 바텀시트 (라이브러리 없이 Modal 기반).
 * - 배경 탭/우상단 X로 닫힘
 * - 내용이 길면 내부 ScrollView로 위아래 스크롤
 * - 키보드가 올라오면 키보드 높이만큼 시트를 올린다 (안드로이드 Modal은 KeyboardAvoidingView가
 *   잘 안 먹어서, 키보드 높이를 직접 측정해 marginBottom으로 올린다).
 */
export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => setKbHeight(e.endCoordinates?.height ?? 0));
    const hide = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* 배경: 탭하면 닫힘 */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        {/* 키보드 높이 + 여유분만큼 위로 올림 (저장 버튼이 키보드에 안 걸리게) */}
        <View
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: '85%', marginBottom: kbHeight > 0 ? kbHeight + 40 : 0 }}
        >
          {/* 핸들바 */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>
          <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
            <Text className="font-sans-bold text-lg">{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="w-7 h-7 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          {/* 내용: 길면 스크롤. 키보드 없을 땐 하단 safe-area만큼 패딩 */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: kbHeight > 0 ? 16 : insets.bottom + 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            bounces
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
