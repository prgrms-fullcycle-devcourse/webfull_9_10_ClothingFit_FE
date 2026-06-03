import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

const CARD_WIDTH = Dimensions.get('window').width * 0.3;

type Props = {
  width?: number;
  imageUrl: string;
  likeCount: number;
  isLiked: boolean;
  onPress: () => void;
};

export function OtherPostCard({
  width = CARD_WIDTH,
  imageUrl,
  likeCount,
  isLiked,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} style={{ width }} className="overflow-hidden">
      <View className="w-full aspect-[3/4]">
        <Image source={{ uri: imageUrl }} className="absolute inset-0 w-full h-full rounded-none" />
        <View className="absolute bottom-2 right-2 flex-row items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={11} color="#fff" />
          <Text className="text-white text-xs">{likeCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}
