import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';

type SizeTable = Record<string, Record<string, number>>;

type Props = {
  visible: boolean;
  sizeTable: SizeTable;
  onPick: (sizeName: string, measurements: Record<string, number>) => void;
  onCancel: () => void;
};

export function SizePickerModal({ visible, sizeTable, onPick, onCancel }: Props) {
  const sizeNames = Object.keys(sizeTable);
  // 헤더로 쓸 필드명을 첫 사이즈의 키 순서대로
  const fields = sizeNames.length > 0 ? Object.keys(sizeTable[sizeNames[0]]) : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl pt-3 pb-6 max-h-[85%]">
          <View className="items-center mb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-2">
            <Text variant="subtitle" className="font-sans-bold">
              사이즈를 선택해 주세요
            </Text>
            <Pressable onPress={onCancel} hitSlop={8}>
              <Ionicons name="close" size={22} color="#111827" />
            </Pressable>
          </View>

          {/* 사이즈표 */}
          <ScrollView horizontal className="px-5 mt-2" showsHorizontalScrollIndicator={false}>
            <View>
              {/* 헤더 */}
              <View className="flex-row border-b border-gray-200 pb-2">
                <View className="w-14" />
                {fields.map((f) => (
                  <View key={f} className="w-16 items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{f}</Text>
                  </View>
                ))}
              </View>
              {/* 행 */}
              {sizeNames.map((size) => (
                <Pressable
                  key={size}
                  onPress={() => onPick(size, sizeTable[size])}
                  className="flex-row items-center py-3 border-b border-gray-100 active:bg-gray-50"
                >
                  <View className="w-14">
                    <Text className="font-sans-bold text-base">{size}</Text>
                  </View>
                  {fields.map((f) => (
                    <View key={f} className="w-16 items-center">
                      <Text className="text-sm font-sans">
                        {sizeTable[size][f] != null ? `${sizeTable[size][f]}` : '-'}
                      </Text>
                    </View>
                  ))}
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text variant="caption" className="text-center mt-3 px-6">
            행을 탭하여 선택
          </Text>
        </View>
      </View>
    </Modal>
  );
}
