import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

type BookmarkIconProps = {
  isBookmarked: boolean;
  size?: number;
  color?: string;
  onPress?: () => void;
};

export function BookmarkIcon({
  isBookmarked,
  size = 24,
  color = '#111827',
  onPress,
}: BookmarkIconProps) {
  const content = (
    <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={size} color={color} />
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
