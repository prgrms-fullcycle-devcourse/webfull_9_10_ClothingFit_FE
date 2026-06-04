import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import { FollowButton } from './follow-button';

type Props = {
  nickname: string;
  isFollowing: boolean;
  onPressFollow: () => void;
};

export function FeedDetailHeader({ nickname, isFollowing, onPressFollow }: Props) {
  return (
    <View className="px-4 py-3 flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-surface" />
      <Text className="font-sans-medium flex-1">{nickname}</Text>
      <FollowButton isFollowing={isFollowing} onPress={onPressFollow} />
    </View>
  );
}
