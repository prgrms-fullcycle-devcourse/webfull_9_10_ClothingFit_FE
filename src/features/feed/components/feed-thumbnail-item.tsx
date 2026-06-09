import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, View } from 'react-native';

import { HeartIcon } from '@/components/ui/heart-icon';
import { Text } from '@/components/ui/text';
import { usePostLike } from '../hooks/use-post-like';

type Props = {
  id: string;
  imageUrl: string;
  isLiked: boolean;
  likeCount: number;
  nickname?: string;
  width: number;
  onPress: () => void;
};

export function FeedThumbnailItem({
  id,
  imageUrl,
  isLiked,
  likeCount,
  nickname,
  width,
  onPress,
}: Props) {
  const { isLiked: liked, toggle } = usePostLike({ id, isLiked, likeCount });

  return (
    <Pressable style={{ width, overflow: 'hidden' }} onPress={onPress}>
      <View className="w-full aspect-[2/5]">
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          className="flex-row items-center justify-between"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            gap: 4,
            padding: 8,
            paddingTop: 24,
          }}
        >
          {nickname ? (
            <Text className="font-sans-bold text-white flex-1" numberOfLines={1}>
              {nickname}
            </Text>
          ) : (
            <View />
          )}
          <HeartIcon isLiked={liked} size={18} onPress={toggle} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}
