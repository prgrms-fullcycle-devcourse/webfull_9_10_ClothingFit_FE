import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { dismissBanner, useBanner } from '@/features/notifications/banner-store';

const HIDDEN_Y = -160;
const AUTO_DISMISS_MS = 4000;
const DISMISS_THRESHOLD = 20; // 이만큼 위로 끌면 닫힘
const FLING_VELOCITY = -800; // 이보다 빠르게 위로 튕기면 닫힘

/** 화면 최상단에 떠서 내려오는 인앱 알림 배너 (루트에 1개만 마운트) */
export function AppBanner() {
  const banner = useBanner();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(HIDDEN_Y);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const armTimer = () => {
    cancelTimer(); // 혹시 남아있을 수 있으니 중복 방지
    timerRef.current = setTimeout(animateOut, AUTO_DISMISS_MS);
  };

  // 위로 슬라이드시키며 닫기 (자동 타이머/탭 모두 여기로)
  const animateOut = () => {
    cancelTimer();
    translateY.value = withTiming(HIDDEN_Y, { duration: 200 }, (finished) => {
      if (finished) runOnJS(dismissBanner)();
    });
  };

  useEffect(() => {
    if (!banner) return;
    translateY.value = HIDDEN_Y;
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    armTimer();
    return cancelTimer;
  }, [banner?.id]);

  const handlePress = () => {
    const route = banner?.route;
    animateOut();
    if (route) router.push(route);
  };

  // 위로 스와이프: 손가락 따라 올라가고, 임계치/속도 넘으면 닫힘, 아니면 제자리로
  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(cancelTimer)(); // 드래그 시작하면 자동 닫힘 멈춤
    })
    .onUpdate((e) => {
      // 위(음수)로는 자유롭게, 아래(양수)로는 저항을 줘서 살짝만
      translateY.value = e.translationY < 0 ? e.translationY : e.translationY * 0.2;
    })
    .onEnd((e) => {
      if (e.translationY < -DISMISS_THRESHOLD || e.velocityY < FLING_VELOCITY) {
        translateY.value = withTiming(HIDDEN_Y, { duration: 180 }, (finished) => {
          if (finished) runOnJS(dismissBanner)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        runOnJS(armTimer)(); // 제자리로 돌아왔으니 자동 닫힘 타이머 재무장
      }
    });

  const tap = Gesture.Tap().onEnd((_e, success) => {
    if (success) runOnJS(handlePress)();
  });

  // 드래그면 pan, 가만히 누르면 tap (pan 우선)
  const gesture = Gesture.Exclusive(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!banner) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 6,
          paddingHorizontal: 12,
          zIndex: 9999,
          elevation: 9999,
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View className="flex-row items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 shadow-lg">
          <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-sans-bold text-sm">{banner.title}</Text>
            {banner.message ? (
              <Text className="text-white/80 font-sans text-xs">{banner.message}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
