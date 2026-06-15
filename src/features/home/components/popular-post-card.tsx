import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import type { PopularPost } from '@/features/home/api';

/** ISO date-time → YYYY.MM.DD */
function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function PopularPostCard({ post }: { post: PopularPost }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.postId } })}
      className="overflow-hidden bg-white"
    >
      {/* 인물 이미지 (세로 0.9) — 영역을 꽉 채우게 cover + 하단 그라데이션 오버레이 */}
      <View className="w-full justify-end bg-white" style={{ aspectRatio: 1 }}>
        <Image
          source={post.image}
          contentFit="cover"
          className="absolute inset-0 h-full w-full rounded-none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          className="gap-1"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 14,
            paddingBottom: 14,
            paddingTop: 100,
          }}
        >
          <Text
            className="font-sans-bold text-lg text-white pl-2"
            numberOfLines={1}
            style={{ includeFontPadding: false }}
          >
            {post.nickname}
          </Text>
          <View className="flex-row items-center gap-6 pl-1">
            <Text
              className="font-sans-bold text-md text-white"
              style={{ includeFontPadding: false }}
            >
              {formatDate(post.createdAt)}
            </Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={15} color="#fff" />
              <Text
                className="font-sans-bold text-md text-white"
                style={{ includeFontPadding: false }}
              >
                {post.likeCount}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 게시글에 사용된 옷 사진들 — 회색 띠 위에 한 줄 5개씩 꽉 차게 (개수 많으면 줄바꿈) */}
      {post.itemImages.length > 0 && (
        <View className="flex-row flex-wrap bg-surface p-1">
          {post.itemImages.map((uri, i) => (
            <View key={`${uri}-${i}`} style={{ width: '20%', padding: 5 }}>
              <View className="w-full overflow-hidden rounded-lg" style={{ aspectRatio: 4.5 / 5 }}>
                <Image source={uri} contentFit="cover" className="h-full w-full" />
              </View>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
