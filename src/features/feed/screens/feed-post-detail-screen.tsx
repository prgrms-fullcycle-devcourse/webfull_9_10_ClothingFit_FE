import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';

import { useGetPostsId } from '@/api/generated/endpoints/posts/posts';
import { GetPostByIdResponse } from '@/api/generated/schemas';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { BookmarkIcon } from '@/components/ui/bookmark-icon';
import { HeartIcon } from '@/components/ui/heart-icon';
import { Text } from '@/components/ui/text';
import { ProfileHeader } from '@/features/profile/components/profile-header';
import { getUserId } from '@/lib/auth-storage';
import { formatDate } from '@/lib/format';
import { ClothInfo } from '../components/cloth-info';
import { FollowButton } from '../components/follow-button';
import { OtherPosts } from '../components/other-posts';
import { usePostBookmark } from '../hooks/use-post-bookmark';
import { usePostLike } from '../hooks/use-post-like';
import { useUserFollow } from '../hooks/use-user-follow';

function FeedPostDetailContent({ post }: { post: GetPostByIdResponse }) {
  const userId = post.user.id;
  const [imageVisible, setImageVisible] = useState(false);
  const [is3d, setIs3d] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null | undefined>(undefined);
  const { width, height } = useWindowDimensions();
  const has3d = !!post.model3dUrl;

  useEffect(() => {
    getUserId().then(setMyUserId);
  }, []);

  const isMe = !!myUserId && myUserId === userId;

  const { isFollowing, toggle: toggleFollow } = useUserFollow({
    userId,
    isFollowing: post.user.isFollowing,
  });

  const {
    isLiked,
    likeCount,
    toggle: toggleLike,
  } = usePostLike({
    id: post.id,
    isLiked: post.isLiked,
    likeCount: post.likeCount,
  });

  const { isBookmarked, toggle: toggleBookmark } = usePostBookmark({
    id: post.id,
    isBookmarked: post.isBookmarked,
  });

  return (
    <ScreenShell title="게시물">
      <Modal
        visible={imageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/90 items-center justify-center"
          onPress={() => setImageVisible(false)}
        >
          <Pressable onPress={() => {}} className="w-full">
            <Image
              source={{ uri: post.image2dUrl }}
              style={{ width, height: height * 0.8 }}
              resizeMode="contain"
            />
          </Pressable>
          <Pressable onPress={() => setImageVisible(false)} className="absolute top-12 right-4 p-2">
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </Pressable>
      </Modal>
      <ScrollView className="flex-1">
        <ProfileHeader
          nickname={post.user.nickname ?? ''}
          imageUrl={post.user.imageUrl}
          action={
            myUserId !== undefined && !isMe ? (
              <FollowButton isFollowing={isFollowing} onPress={toggleFollow} />
            ) : undefined
          }
          imgSize="md"
          onPress={
            myUserId !== undefined && !isMe
              ? () => router.push(`/(tabs)/profile/user/${userId}`)
              : undefined
          }
        />
        {is3d && has3d ? (
          <View style={{ height: 400 }} className="bg-surface items-center justify-center">
            <Text variant="caption" className="text-muted">
              3D 뷰어 준비 중
            </Text>
          </View>
        ) : (
          <Pressable onPress={() => setImageVisible(true)}>
            <Image source={{ uri: post.image2dUrl }} style={{ height: 400 }} resizeMode="contain" />
          </Pressable>
        )}
        <View className="flex-row justify-between px-4 py-4 gap-4">
          <Text>{formatDate(post.createdAt)}</Text>
          <View className="flex-row gap-4 items-center">
            {has3d && (
              <Pressable
                onPress={() => setIs3d((v) => !v)}
                className="px-2 py-1 rounded border border-border"
              >
                <Text variant="caption" className="font-sans-bold">
                  {is3d ? '2D' : '3D'}
                </Text>
              </Pressable>
            )}
            <HeartIcon
              isLiked={isLiked}
              onPress={toggleLike}
              size={18}
              color="#111827"
              count={likeCount}
            />
            <BookmarkIcon
              isBookmarked={isBookmarked}
              size={18}
              color="#111827"
              onPress={toggleBookmark}
            />
          </View>
        </View>
        <Text variant="subtitle" className="px-4 mb-2">
          착용 제품
        </Text>
        {post.items.map((item, index) => (
          <ClothInfo key={index} item={item} />
        ))}
        <View className="px-4 pt-3 pb-1 flex-row">
          <Text className="font-sans-bold">{post.user.nickname ?? ''}</Text>
          <Text className="font-sans-medium">님의 다른 스타일</Text>
        </View>
        <View className="pb-3">
          <OtherPosts posts={post.otherPosts} />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function FeedPostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { data, isLoading, isError } = useGetPostsId(postId, {
    query: { enabled: !!postId },
  });

  if (isLoading) {
    return (
      <ScreenShell title="게시물">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenShell>
    );
  }

  if (isError || !data) {
    return (
      <ScreenShell title="게시물">
        <View className="flex-1 items-center justify-center gap-2">
          <Ionicons name="alert-circle-outline" size={48} color="#888" />
          <Text variant="caption">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      </ScreenShell>
    );
  }

  return <FeedPostDetailContent post={data} />;
}
