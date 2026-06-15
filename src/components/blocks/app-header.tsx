import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useUnreadNotificationCount } from '@/features/notifications/api';

/**
 * 앱 공통 헤더 — "CLOTHING - FIT" 타이틀 + 우측 알림(벨) 아이콘 + 안읽음 뱃지.
 * 홈/옷장 등 최상위 탭 화면에서 공통으로 사용한다.
 */
export function AppHeader() {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
      <Text variant="title">CLOTHING - FIT</Text>
      <Pressable onPress={() => router.push('/(tabs)/profile/notifications')} hitSlop={8}>
        <Ionicons name="notifications-outline" size={24} color="#111827" />
        {unreadCount > 0 && (
          <View className="absolute -right-1.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
            <Text
              className="text-[10px] font-sans-bold text-white"
              // 작은 뱃지 안에서 NotoSansKR 글리프가 아래로 잘리는 것 방지
              style={{ includeFontPadding: false, lineHeight: 12, textAlignVertical: 'center' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
