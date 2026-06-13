import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from './text';

type HeartIconProps = {
  isLiked: boolean;
  count?: number;
  iconSize?: number;
  color?: string;
  onPress?: () => void;
};

export function HeartIcon({
  isLiked,
  count,
  iconSize = 16,
  color = '#fff',
  onPress,
}: HeartIconProps) {
  const iconColor = isLiked ? '#dc2626' : color;
  const content = (
    <View className="flex-row gap-2 items-center">
      <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={iconSize} color={iconColor} />
      {count !== undefined && (
        <Text className="text-md" style={{ color }}>
          {count}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
