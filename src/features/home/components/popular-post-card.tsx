import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import type { PopularPost } from '@/features/home/api';
import { cn } from '@/utils/cn';

/** 오른쪽 옷 썸네일 스트립 설정 — 카드 폭 대비 스트립 폭 비율, 그리고 높이 기준이 되는 썸네일 개수(정사각형).
 *  카드 높이 = ITEM_STRIP_COUNT × (ITEM_STRIP_RATIO × 카드폭). 캐러셀이 이 값으로 높이를 계산한다. */
export const ITEM_STRIP_RATIO = 0.26;
export const ITEM_STRIP_COUNT = 5;

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
  const hasItems = post.itemImages.length > 0;
  return (
    // 바깥 레이어: 그림자 담당(overflow 없음 + 배경색 필요). 안쪽이 모서리 클리핑.
    // 그림자는 boxShadow(반투명)로 카드 뒤에 깔린다 — LinearGradient로 그리면 불투명 레이어가 콘텐츠를 덮으므로 쓰지 않는다.
    // 알파는 0~1 범위. (이전 rgba(0,0,0,2)는 1로 클램핑돼 완전 불투명이라 콘텐츠가 가려졌다.)
    <View className="h-full rounded-2xl bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
      <Pressable
        onPress={() => router.push({ pathname: '/post/[postId]', params: { postId: post.postId } })}
        className="h-full flex-row overflow-hidden rounded-2xl"
      >
        {/* 왼쪽: 메인 인물 이미지 — 남는 폭을 모두 차지(flex-1).
          높이는 오른쪽 옷 스트립이 결정하고, 이미지는 absolute로 그 높이를 꽉 채운다.
          옷 사진이 없으면 스트립이 없어 높이를 줄 게 없으므로 aspectRatio로 대체한다. */}
        <View
          className={cn('justify-end bg-white', hasItems ? 'flex-1' : 'w-full')}
          style={hasItems ? undefined : { aspectRatio: 0.8 }}
        >
          {/* 캐러셀이 아이템 View를 재활용하므로 recyclingKey로 올바른 이미지를 고정하고,
            transition=0으로 슬라이드마다 페이드(깜빡임)가 재생되지 않게 한다. */}
          <Image
            source={post.image}
            contentFit="cover"
            className="absolute inset-0 h-full w-full rounded-none"
            recyclingKey={String(post.postId)}
            transition={0}
          />
        </View>

        {/* 오른쪽: 게시글에 쓰인 옷 사진들 — 세로 스트립(고정 폭). 정사각형 썸네일을 최대 5개까지 쌓는다.
          5개 × 정사각형 = 카드 높이. 5개 미만이면 아래에 빈 공간이 남는다. */}
        {hasItems && (
          <View className="bg-[#373737] p-2.5" style={{ width: `${ITEM_STRIP_RATIO * 100}%` }}>
            {post.itemImages.slice(0, ITEM_STRIP_COUNT).map((uri, i) => (
              <View
                key={`${uri}-${i}`}
                className="w-full"
                style={{ aspectRatio: 1, marginBottom: 10 }}
              >
                <Image
                  source={uri}
                  contentFit="cover"
                  className="h-full w-full rounded-md"
                  recyclingKey={uri}
                  transition={0}
                />
              </View>
            ))}
            <Text
              className="font-sans-bold text-sm text-white"
              numberOfLines={1}
              style={{
                position: 'absolute',
                right: 14,
                bottom: 10,
                includeFontPadding: false,
                display: 'block',
                maxWidth: 70,
              }}
            >
              @{post.nickname}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
