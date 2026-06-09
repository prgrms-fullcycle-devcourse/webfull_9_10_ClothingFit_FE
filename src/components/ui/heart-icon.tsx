import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from './text';

type HeartIconProps = {
  isLiked: boolean;
  count?: number;
  size?: number;
  color?: string;
  onPress?: () => void;
};

export function HeartIcon({ isLiked, count, size = 13, color = '#fff', onPress }: HeartIconProps) {
  const iconColor = isLiked ? '#dc2626' : color;
  const content = (
    <View className="flex-row gap-1 items-center">
      <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={size} color={iconColor} />
      {count !== undefined && <Text style={{ fontSize: size, color }}>{count}</Text>}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
