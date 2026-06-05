import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { Text } from '@/components/ui/text';

// 스크래핑(상품 정보 추출) 동안 순환 표시할 문구
const MESSAGES = [
  '상품 정보를 추출하고 있어요',
  '사이즈 정보를 찾는 중이에요',
  '거의 다 왔어요, 조금만 기다려 주세요',
];

type ScanSpinnerOverlayProps = {
  visible: boolean;
  /** (선택) 문구를 강제로 고정. 없으면 순환 문구. */
  message?: string;
};

/**
 * COPY 직후 스크래핑(상품 정보 추출) 동안 보여주는 로딩 오버레이.
 * 동글동글 도는 스피너 + 진행 문구가 순환한다. (게이지가 아닌 단순 스피너)
 */
export function ScanSpinnerOverlay({ visible, message }: ScanSpinnerOverlayProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!visible) {
      setIdx(0);
      return;
    }
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/70 px-10">
        <View className="items-center gap-5">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white font-sans-bold text-base text-center">
            {message ?? MESSAGES[idx]}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
