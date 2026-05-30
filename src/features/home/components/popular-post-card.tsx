import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { PERSON_IMAGES, personImageAt } from '@/features/home/constants/person-images';

type Post = {
  id: string;
  nickname: string;
  createdAt: string;
  likes: number;
  imageColor: string;
};

type Product = { id: string };

export function PopularPostCard({
  post,
  products,
  index = 0,
}: {
  post: Post;
  products: Product[];
  index?: number;
}) {
  const personImage = personImageAt(index);

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-white">
      {/* 인물 이미지 (전체가 다 보이게 중앙 배치) + 오버레이 — 모바일 세로 4:5 */}
      <View
        className="w-full justify-end"
        style={{ aspectRatio: 0.9, backgroundColor: post.imageColor }}
      >
        <Image
          source={personImage}
          contentFit="contain"
          className="absolute inset-0 h-full w-full"
        />
        <View className="gap-1 bg-black/25 p-3">
          <Text className="font-sans-bold text-white">{post.nickname}</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-white">{post.createdAt}</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="heart" size={13} color="#fff" />
              <Text className="text-xs text-white">{post.likes}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 게시글에 사용된 옷 사진들 (전부 이미지 슬롯) */}
      <View className="flex-row flex-wrap gap-2 p-3">
        {products.map((product, i) => (
          <Image
            key={product.id}
            source={PERSON_IMAGES[(index + i + 1) % PERSON_IMAGES.length]}
            contentFit="cover"
            className="h-14 w-14 rounded-lg border border-border bg-surface"
          />
        ))}
      </View>
    </View>
  );
}
