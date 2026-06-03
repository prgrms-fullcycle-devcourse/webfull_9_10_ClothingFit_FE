import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { TabButton } from '@/components/ui/tab-button';
import { Tag } from '@/components/ui/tag';
import { Text } from '@/components/ui/text';
import { MOCK_POSTS } from '@/mocks/data';

import { ResetButton } from '../components/reset-button';

type Tabs = 'recommend' | 'following';
type Filter = 'gender' | 'body' | 'sort' | null;

export function FeedHomeScreen() {
  const [tab, setTab] = useState<Tabs>('recommend');
  const [activeFilter, setActiveFilter] = useState<Filter>(null);
  return (
    <ScreenShell title="커뮤니티" showBack={false}>
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
      <View className="flex-row px-4 pb-2 gap-2">
        <Tag text="성별" menuArrow onPress={() => setActiveFilter('gender')} />
        <Tag text="키/몸무게" menuArrow onPress={() => setActiveFilter('body')} />
        <Tag text="최신순" menuArrow onPress={() => setActiveFilter('sort')} />
        <ResetButton onPress={() => setActiveFilter(null)} />
      </View>

      <BottomSheet visible={activeFilter !== null} onClose={() => setActiveFilter(null)}>
        <View className="px-4 py-4">
          {activeFilter === 'gender' && <Text className="font-sans-medium">성별 필터</Text>}
          {activeFilter === 'body' && <Text className="font-sans-medium">키/몸무게 필터</Text>}
          {activeFilter === 'sort' && <Text className="font-sans-medium">정렬 방식</Text>}
        </View>
      </BottomSheet>
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        className="flex-1"
        columnWrapperStyle={{ gap: 1 }}
        contentContainerStyle={{ gap: 1 }}
        renderItem={({ item }) => (
          <Pressable
            className="flex-1 overflow-hidden"
            onPress={() => router.push(`/(tabs)/feed/${item.id}`)}
          >
            <View className="w-full aspect-[2/5]">
              <View className="absolute inset-0" style={{ backgroundColor: item.imageColor }} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, gap: 4, padding: 12 }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans-bold text-white">{item.nickname}</Text>
                  <View className="flex-row gap-1 items-center right-0">
                    <Ionicons name="heart" size={13} color="#fff" />
                    <Text className="text-xs text-white">{item.likes}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
