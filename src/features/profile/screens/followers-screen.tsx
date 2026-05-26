import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_FOLLOWERS } from '@/mocks/data';

export function FollowersScreen() {
  const [tab, setTab] = useState<'followers' | 'following'>('followers');

  return (
    <ScreenShell title="팔로워 · 팔로잉">
      <View className="flex-row border-b border-border">
        <Pressable
          className={`flex-1 py-3 items-center ${tab === 'followers' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setTab('followers')}>
          <Text className="font-sans-medium">팔로워 3명</Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-3 items-center ${tab === 'following' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setTab('following')}>
          <Text className="font-sans-medium">팔로잉 4명</Text>
        </Pressable>
      </View>
      <FlatList
        data={MOCK_FOLLOWERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-surface mr-3" />
            <Text className="flex-1 font-sans-medium">{item.nickname}</Text>
            <View className={`px-4 py-2 rounded-lg ${item.isFollowing ? 'bg-accent' : 'bg-primary'}`}>
              <Text className="text-white text-sm font-sans-medium">
                {item.isFollowing ? '팔로잉' : '팔로우'}
              </Text>
            </View>
          </View>
        )}
      />
    </ScreenShell>
  );
}
