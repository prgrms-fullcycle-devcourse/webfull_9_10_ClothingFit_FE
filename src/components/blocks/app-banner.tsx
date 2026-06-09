import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { dismissBanner, useBanner } from '@/features/notifications/banner-store';

const HIDDEN_Y = -160;
const AUTO_DISMISS_MS = 4000;

/** 화면 최상단에 떠서 내려오는 인앱 알림 배너 (루트에 1개만 마운트) */
export function AppBanner() {
  const banner = useBanner();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;

  const hide = () => {
    Animated.timing(translateY, {
      toValue: HIDDEN_Y,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) dismissBanner();
    });
  };

  useEffect(() => {
    if (!banner) return;
    translateY.setValue(HIDDEN_Y);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 14,
    }).start();
    const timer = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.id]);

  if (!banner) return null;

  const handlePress = () => {
    const route = banner.route;
    hide();
    if (route) router.push(route);
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + 6,
        paddingHorizontal: 12,
        transform: [{ translateY }],
        zIndex: 9999,
        elevation: 9999,
      }}
    >
      <Pressable
        onPress={handlePress}
        className="flex-row items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 shadow-lg"
      >
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
      </Pressable>
    </Animated.View>
  );
}
