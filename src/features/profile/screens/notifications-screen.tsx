import { FlatList, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import { MOCK_NOTIFICATIONS } from '@/mocks/data';

export function NotificationsScreen() {
  return (
    <ScreenShell title="알림">
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            className={`mb-2 p-4 rounded-xl ${item.read ? 'bg-surface' : 'bg-white border border-border'}`}>
            {!item.read && <View className="w-2 h-2 rounded-full bg-red-500 mb-2" />}
            <Text className="font-sans-medium">{item.title}</Text>
            <Text variant="caption">{item.time}</Text>
          </View>
        )}
      />
    </ScreenShell>
  );
}
