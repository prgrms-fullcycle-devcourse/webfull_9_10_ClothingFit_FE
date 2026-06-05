import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, View } from 'react-native';

import { Text } from '@/components/ui/text';

type ScanOverlayProps = {
  visible: boolean;
  /** (선택) 제목을 강제로 지정. 없으면 진행률에 따라 자동 문구. */
  message?: string;
  hint?: string;
};

// 진행률 구간별 자동 문구 (시간 기반 가짜 게이지에 맞춤)
function autoMessage(pct: number): { title: string; hint: string } {
  if (pct < 45) {
    return { title: '상품 정보를 가져오는 중이에요', hint: '잠시만 기다려 주세요' };
  }
  if (pct < 90) {
    return { title: '사이즈를 분석하고 있어요', hint: '거의 다 왔어요' };
  }
  return { title: '거의 다 됐어요!', hint: '마무리하는 중이에요' };
}

/**
 * 전체화면 로딩 오버레이 + 시간 기반 진행 게이지.
 * - visible이 켜지면 0→90%까지 슬슬 차오르고(진행 느낌), 닫힐 때 100%.
 * - 실제 진행률은 알 수 없어 시간 기반(가짜)이지만 단계 문구로 진행감을 준다.
 * - COPY 직후 WebView 자동 스크롤을 가리는 용도도 겸한다.
 */
export function ScanOverlay({ visible, message, hint }: ScanOverlayProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({ value }) => setPct(value));
    return () => progress.removeListener(id);
  }, [progress]);

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      // 0 → 90%까지 천천히 차오름. 끝나면(visible=false) 100%로.
      Animated.timing(progress, {
        toValue: 90,
        duration: 10000,
        useNativeDriver: false,
      }).start();
    } else {
      // 닫힐 때 100% 탁 채우고 리셋
      Animated.timing(progress, {
        toValue: 100,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, progress]);

  const auto = autoMessage(pct);
  const title = message ?? auto.title;
  const sub = hint ?? auto.hint;

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/70 px-10">
        <View className="w-full items-center gap-5">
          <Text className="text-white font-sans-bold text-base text-center">{title}</Text>

          {/* 진행 게이지 */}
          <View className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <Animated.View
              style={{ width: widthInterpolate }}
              className="h-full rounded-full bg-white"
            />
          </View>

          <Text className="text-white/70 font-sans text-sm text-center">
            {sub} {Math.round(pct)}%
          </Text>
        </View>
      </View>
    </Modal>
  );
}
