import { router } from 'expo-router';
import { FlatList, Pressable } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import {
  markNotificationRead,
  useNotifications,
} from '@/features/notifications/notifications-store';

export function NotificationsScreen() {
  const notifications = useNotifications();

  return (
    <ScreenShell title="알림">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              markNotificationRead(item.id);
              if (item.route) router.push(item.route);
            }}
            className={`mb-2 p-4 rounded-xl ${item.read ? 'bg-surface' : 'bg-white border border-border'}`}
          >
            {!item.read && <Text className="text-red-500 mb-1 text-xs">●</Text>}
            <Text className="font-sans-medium">{item.title}</Text>
            <Text variant="caption">{item.time}</Text>
          </Pressable>
        )}
      />
    </ScreenShell>
  );
}
