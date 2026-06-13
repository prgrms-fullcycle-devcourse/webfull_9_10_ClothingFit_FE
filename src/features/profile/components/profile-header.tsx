import { Image, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

type Size = 'md' | 'lg';

const sizeStyle: Record<
  Size,
  { width: number; height: number; borderRadius: number; className: string }
> = {
  md: {
    width: 48,
    height: 48,
    borderRadius: 24,
    className: 'w-[48px] h-[48px] rounded-full bg-surface',
  },
  lg: { width: 64, height: 64, borderRadius: 32, className: 'w-16 h-16 rounded-full bg-surface' },
};

type Props = {
  nickname: string;
  imageUrl?: string | null;
  imgSize?: Size;
  layout?: 'row' | 'col';
  onPress?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
};

export function ProfileHeader({
  nickname,
  imageUrl,
  imgSize = 'lg',
  layout = 'row',
  onPress,
  action,
  children,
}: Props) {
  const s = sizeStyle[imgSize];

  if (layout === 'col') {
    return (
      <View className="px-4 py-4 gap-5">
        <Pressable className="flex-row gap-4 items-center" onPress={onPress} disabled={!onPress}>
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
        <View className="flex-1 gap-1">
          <Text variant="subtitle">{nickname}</Text>
          {children}
        </View>
      </Pressable>
      {action}
    </View>
  );
}
