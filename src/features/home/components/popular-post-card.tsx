import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import type { PopularPost } from '@/features/home/api/home';

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
    <View className="overflow-hidden rounded-2xl border border-border bg-white">
      {/* 인물 이미지 (모바일 세로 4:5) + 오버레이 */}
      <View className="w-full justify-end" style={{ aspectRatio: 0.9 }}>
        <Image source={post.image} contentFit="cover" className="absolute inset-0 h-full w-full" />
        <View className="gap-1 bg-black/25 p-3">
          <Text className="font-sans-bold text-white">{post.nickname}</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-white">{formatDate(post.createdAt)}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={13} color="#fff" />
              <Text className="text-xs text-white">{post.likeCount}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 게시글에 사용된 옷 사진들 */}
      {post.itemImages.length > 0 && (
        <View className="flex-row flex-wrap gap-2 p-3">
          {post.itemImages.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={uri}
              contentFit="cover"
              className="h-14 w-14 rounded-lg border border-border bg-surface"
            />
          ))}
        </View>
      )}
    </View>
  );
}
