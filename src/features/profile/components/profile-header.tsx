import { Image, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type Size = 'md' | 'lg';

const sizeStyle: Record<
  Size,
  { width: number; height: number; borderRadius: number; className: string }
> = {
  md: { width: 32, height: 32, borderRadius: 16, className: 'w-8 h-8 rounded-full bg-surface' },
  lg: { width: 64, height: 64, borderRadius: 32, className: 'w-16 h-16 rounded-full bg-surface' },
};

type Props = {
  nickname: string;
  imageUrl?: string | null;
  imgSize?: Size;
  onPress?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

export function ProfileHeader({
  nickname,
  imageUrl,
  imgSize = 'lg',
  onPress,
  action,
  children,
}: Props) {
  const s = sizeStyle[imgSize];

  return (
    <View className="px-4 py-4 flex-row gap-4 items-center">
      <Pressable
        className="flex-row gap-4 items-center flex-1"
        onPress={onPress}
        disabled={!onPress}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: s.width, height: s.height, borderRadius: s.borderRadius }}
          />
        ) : (
          <View className={s.className} />
        )}
        <View className="flex-1">
          <Text variant="subtitle">{nickname}</Text>
          {children}
        </View>
      </Pressable>
      {action}
    </View>
  );
}
