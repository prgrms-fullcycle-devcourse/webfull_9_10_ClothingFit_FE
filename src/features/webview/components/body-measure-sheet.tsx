import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';

import { BottomSheet } from './bottom-sheet';

type BodyMeasureSheetProps = {
  visible: boolean;
  initialHeight?: number;
  initialWeight?: number;
  onClose: () => void;
  onSave: (height: number, weight: number) => void;
  onGoDetail: () => void;
};

/**
 * 하단 시트: 키/몸무게 빠른 수정 + 상세 수정 페이지 이동.
 * (실제 신체 데이터 저장은 프로필 담당 영역 — 여기선 onSave 콜백만 호출)
 */
export function BodyMeasureSheet({
  visible,
  initialHeight,
  initialWeight,
  onClose,
  onSave,
  onGoDetail,
}: BodyMeasureSheetProps) {
  const [height, setHeight] = useState(initialHeight ? String(initialHeight) : '');
  const [weight, setWeight] = useState(initialWeight ? String(initialWeight) : '');

  // 시트가 열릴 때마다 최신 신체값으로 입력칸 동기화 (API 비동기 로드 반영)
  useEffect(() => {
    if (visible) {
      setHeight(initialHeight ? String(initialHeight) : '');
      setWeight(initialWeight ? String(initialWeight) : '');
    }
  }, [visible, initialHeight, initialWeight]);

  return (
    <BottomSheet visible={visible} title="신체 치수 수정" onClose={onClose}>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text variant="label" className="mb-1.5">
            키 (cm)
          </Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            placeholder="170"
            className="border border-border rounded-xl px-4 py-3"
          />
        </View>
        <View className="flex-1">
          <Text variant="label" className="mb-1.5">
            몸무게 (kg)
          </Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="number-pad"
            placeholder="65"
            className="border border-border rounded-xl px-4 py-3"
          />
        </View>
      </View>

      <Pressable onPress={onGoDetail} className="mt-4 items-center py-2">
        <Text className="text-primary font-sans-medium">상세 수정 페이지로 이동</Text>
      </Pressable>

      <Button
        label="저장"
        className="mt-3"
        onPress={() => onSave(Number(height) || 0, Number(weight) || 0)}
      />
    </BottomSheet>
  );
}
