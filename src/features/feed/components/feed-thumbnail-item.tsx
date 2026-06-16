import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, View } from 'react-native';

import { BookmarkIcon } from '@/components/ui/bookmark-icon';
import { HeartIcon } from '@/components/ui/heart-icon';
import { Text } from '@/components/ui/text';
import { usePostBookmark } from '../hooks/use-post-bookmark';
import { usePostLike } from '../hooks/use-post-like';

type Props = {
  id: string;
  imageUrl: string;
  isLiked: boolean;
  likeCount: number;
  isBookmarked?: boolean;
  nickname?: string;
  width: number;
  aspectRatio?: number;
  icon?: 'like' | 'bookmark' | 'none';
  onPress: () => void;
};

function LikeButton({
  id,
  isLiked,
  likeCount,
}: {
  id: string;
  isLiked: boolean;
  likeCount: number;
}) {
  const { isLiked: liked, toggle } = usePostLike({ id, isLiked, likeCount });
  return <HeartIcon isLiked={liked} iconSize={18} onPress={toggle} />;
}

function BookmarkButton({ id, isBookmarked }: { id: string; isBookmarked: boolean }) {
  const { isBookmarked: bookmarked, toggle } = usePostBookmark({ id, isBookmarked });
  return <BookmarkIcon isBookmarked={bookmarked} size={18} color="#fff" onPress={toggle} />;
}

export function FeedThumbnailItem({
  id,
  imageUrl,
  isLiked,
  likeCount,
  isBookmarked = false,
  nickname,
  width,
  aspectRatio = 2 / 3,
  icon = 'like',
  onPress,
}: Props) {
  const showOverlay = !!nickname || icon !== 'none';

  return (
    <Pressable style={{ width, overflow: 'hidden' }} onPress={onPress}>
      <View style={{ width: '100%', aspectRatio }}>
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        {showOverlay && (
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
            {icon === 'bookmark' ? (
              <BookmarkButton id={id} isBookmarked={isBookmarked} />
            ) : icon === 'like' ? (
              <LikeButton id={id} isLiked={isLiked} likeCount={likeCount} />
            ) : null}
          </LinearGradient>
        )}
      </View>
    </Pressable>
  );
}
