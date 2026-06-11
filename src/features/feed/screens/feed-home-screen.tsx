import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BASE_HEIGHT } from '@/constants/tab-bar';
import { useTabBarScroll } from '@/features/navigation/use-tab-bar-scroll';

import { GetPostsFollow, GetPostsParams, GetPostsSort } from '@/api/generated/schemas';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TabButton } from '@/components/ui/tab-button';
import { Tag } from '@/components/ui/tag';
import { Text } from '@/components/ui/text';

import { FeedThumbnail } from '../components/feed-thumbnail';
import { BodyFilter } from '../components/filters/body-filter';
import { GenderFilter } from '../components/filters/gender-filter';
import { SortFilter } from '../components/filters/sort-filter';
import { ResetButton } from '../components/reset-button';
import { usePostsInfinite } from '../hooks/use-posts-infinite';

type Tabs = 'recommend' | 'following';
type ActiveFilter = 'gender' | 'body' | 'sort' | null;
type FilterState = Pick<GetPostsParams, 'gender' | 'sort' | 'height' | 'weightMin' | 'weightMax'>;

export function FeedHomeScreen() {
  const [tab, setTab] = useState<Tabs>('recommend');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  const [filters, setFilters] = useState<FilterState>({ sort: GetPostsSort.LATEST });
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const insets = useSafeAreaInsets();
  const scrollHandler = useTabBarScroll();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const params: GetPostsParams = {
    follow: tab === 'following' ? GetPostsFollow.TRUE : undefined,
    keyword: debouncedKeyword || undefined,
    ...filters,
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsInfinite(params);

  const posts = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      );
    }
    if (isError) {
      return (
        <View className="flex-1 items-center justify-center gap-2">
          <Ionicons name="alert-circle-outline" size={48} color="#888" />
          <Text variant="caption">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Text>
        </View>
      );
    }
    return (
      <FeedThumbnail
        posts={posts}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        isLoadingMore={isFetchingNextPage}
        onScroll={scrollHandler}
        bottomInset={TAB_BAR_BASE_HEIGHT + insets.bottom}
      />
    );
  };

  return (
    <ScreenShell noHeader>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <View className="flex-row gap-2 py-3 pl-3">
          <TabButton
            label="추천"
            selected={tab === 'recommend'}
            onPress={() => setTab('recommend')}
          />
          <TabButton
            label="팔로잉"
            selected={tab === 'following'}
            onPress={() => setTab('following')}
          />
        </View>
        <View className="flex-row items-center mx-4 mb-3 px-3 rounded-xl border border-border gap-2">
          <Ionicons name="search-outline" size={18} color="#6a7282" />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="검색"
            placeholderTextColor="#6a7282"
            returnKeyType="search"
            style={{ flex: 1, paddingVertical: 10, fontSize: 14 }}
          />
          {keyword.length > 0 && (
            <Pressable onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color="#6a7282" />
            </Pressable>
          )}
        </View>
        <View className="flex-row px-4 pb-2 gap-2">
          <Tag
            text={
              filters.gender === 'MALE' ? '남성' : filters.gender === 'FEMALE' ? '여성' : '성별'
            }
            menuArrow
            selected={!!filters.gender}
            onPress={() => setActiveFilter('gender')}
          />
          <Tag
            text={
              filters.height || filters.weightMin != null || filters.weightMax != null
                ? [
                    filters.height ? `${filters.height}cm` : null,
                    filters.weightMin != null || filters.weightMax != null
                      ? `${filters.weightMin ?? 0}~${filters.weightMax ?? 500}kg`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : '키/몸무게'
            }
            menuArrow
            selected={!!(filters.height || filters.weightMin != null || filters.weightMax != null)}
            onPress={() => setActiveFilter('body')}
          />
          <Tag
            text={
              filters.sort === 'LATEST'
                ? '최신순'
                : filters.sort === 'OLDEST'
                  ? '오래된순'
                  : filters.sort === 'LIKE'
                    ? '좋아요순'
                    : '최신순'
            }
            menuArrow
            selected={!!filters.sort}
            onPress={() => setActiveFilter('sort')}
          />
          <ResetButton
            onPress={() => {
              setFilters({ sort: GetPostsSort.LATEST });
              setActiveFilter(null);
            }}
          />
        </View>

        <BottomSheet visible={activeFilter !== null} onClose={() => setActiveFilter(null)}>
          {activeFilter === 'gender' && (
            <GenderFilter
              value={filters.gender}
              onChange={(gender) => {
                setFilters((prev) => ({ ...prev, gender }));
                setActiveFilter(null);
              }}
            />
          )}
          {activeFilter === 'sort' && (
            <SortFilter
              value={filters.sort}
              onChange={(sort) => {
                setFilters((prev) => ({ ...prev, sort }));
                setActiveFilter(null);
              }}
            />
          )}
          {activeFilter === 'body' && (
            <BodyFilter
              value={{
                height: filters.height,
                weightMin: filters.weightMin,
                weightMax: filters.weightMax,
              }}
              onApply={(body) => {
                setFilters((prev) => ({ ...prev, ...body }));
                setActiveFilter(null);
              }}
            />
          )}
        </BottomSheet>

        {renderContent()}
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}
