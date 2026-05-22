import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '마이' }} />
      <Stack.Screen name="body" options={{ title: '체형 정보' }} />
      <Stack.Screen name="fitting-history" options={{ title: '피팅 기록' }} />
      <Stack.Screen name="settings" options={{ title: '설정' }} />
    </Stack>
  );
}
