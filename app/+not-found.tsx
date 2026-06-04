import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text variant="subtitle" className="mb-4">
          This screen does not exist.
        </Text>
        <Link href="/(tabs)/fitting">
          <Text className="text-accent">피팅 홈으로</Text>
        </Link>
      </View>
    </>
  );
}
