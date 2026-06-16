import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  /** 뒤로가기 동작 커스텀 (없으면 router.back()) */
  onBack?: () => void;
  /** 제목을 누르면 호출 (제목 옆 ✏️ 표시 — 이름 편집 등) */
  onTitlePress?: () => void;
  /** 제목 텍스트 크기. 기본 'title'(24px, 홈 헤더와 통일). 작게 하려면 'subtitle'(18px) */
  titleVariant?: 'title' | 'subtitle';
};

export function ScreenHeader({
  title,
  showBack = true,
  right,
  onBack,
  onTitlePress,
  titleVariant = 'title',
}: ScreenHeaderProps) {
  return (
    <View className="z-10 flex-row items-center justify-between bg-white px-4 py-3">
      <View className="flex-row items-center gap-2 flex-1 mr-3">
        {showBack ? (
          <Pressable
            onPress={
              onBack ??
              (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')))
            }
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
        ) : (
          <View className="w-6" />
        )}
        {onTitlePress ? (
          <Pressable
            onPress={onTitlePress}
            hitSlop={6}
            className="flex-row items-center gap-1.5 flex-1"
          >
            <Text variant={titleVariant} numberOfLines={1} className="flex-shrink">
              {title}
            </Text>
            <Feather name="edit-2" size={15} color="#6b7280" />
          </Pressable>
        ) : (
          <Text variant={titleVariant} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      {right ?? <View className="w-6" />}
    </View>
  );
}
