import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_OTHER_POSTS, MOCK_POSTS, MOCK_USER, MOCK_WORN_PRODUCTS } from '@/mocks/data';

import { ClothInfo } from '../components/cloth-info';
import { FeedDetailHeader } from '../components/feed-detail-header';
import { OtherPosts } from '../components/other-posts';

export function FeedPostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const post = MOCK_POSTS.find((p) => p.id === postId) ?? MOCK_POSTS[0];
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <ScreenShell title="게시물">
      <ScrollView className="flex-1">
        <FeedDetailHeader
          nickname={MOCK_USER.nickname}
          isFollowing={isFollowing}
          onPressFollow={() => setIsFollowing((prev) => !prev)}
        />
        <View style={{ height: 400, backgroundColor: post.imageColor }} />
        <View className="flex-row justify-between px-4 py-3 gap-4">
          <Text>{post.createdAt}</Text>
          <View className="flex-row gap-4 items-center">
            <Text>
              <Ionicons name="heart" size={13} color="#111827" /> {post.likes}
            </Text>
            <Feather name="bookmark" size={24} color="black" />
          </View>
        </View>
        <Text variant="subtitle" className="px-4 mb-2">
          착용 제품
        </Text>
        {MOCK_WORN_PRODUCTS.map((p) => (
          <ClothInfo key={p.id} brand={p.brand} name={p.name} />
        ))}
        <View className="px-4 pt-3 pb-1 flex-row">
          <Text className="font-sans-bold">{MOCK_USER.nickname}</Text>
          <Text className="font-sans-medium">님의 다른 스타일</Text>
        </View>
        <View className="pb-3">
          <OtherPosts posts={MOCK_OTHER_POSTS} />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
