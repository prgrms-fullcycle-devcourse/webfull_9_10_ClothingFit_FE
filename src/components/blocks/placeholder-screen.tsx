import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  title: string;
  description?: string;
};

export function PlaceholderScreen({ title, description }: Props) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text variant="subtitle" className="mb-2 text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" className="text-center">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
