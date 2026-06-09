import { ActivityIndicator, Switch, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/features/notifications/api';

export function NotificationSettingsScreen() {
  const settings = useNotificationSettings();
  const update = useUpdateNotificationSettings();

  return (
    <ScreenShell title="알림 설정">
      <View className="flex-1 px-4 pt-2">
        {settings.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : settings.isError ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text variant="caption">
              알림 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-between border-b border-border py-4">
            <View className="flex-1 pr-4">
              <Text className="font-sans-medium">푸시 알림</Text>
              <Text variant="caption">좋아요·팔로우·피팅 완료 등 알림을 받습니다.</Text>
            </View>
            <Switch
              value={settings.data?.enabled ?? false}
              disabled={update.isPending}
              onValueChange={(next) => update.mutate({ data: { enabled: next } })}
            />
          </View>
        )}
      </View>
    </ScreenShell>
  );
}
