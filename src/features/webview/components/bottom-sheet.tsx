import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
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
 * - 안드로이드 제스처/네비게이션 바와 겹치지 않게 하단 safe-area 패딩 적용
 */
export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        {/* 배경: 탭하면 닫힘 */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '85%' }}>
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

          {/* 내용: 길면 스크롤. 하단 safe-area만큼 패딩 줘서 시스템 바와 안 겹침 */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            bounces
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
