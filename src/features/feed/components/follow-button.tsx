import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  isFollowing: boolean;
  onPress: () => void;
};

export function FollowButton({ isFollowing, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-6 py-2 rounded-full ${isFollowing ? 'bg-accent' : 'bg-primary'}`}
    >
      <Text className="text-white text-md leading-normal font-sans-medium">
        {isFollowing ? '팔로잉' : '팔로우'}
      </Text>
    </Pressable>
  );
}
