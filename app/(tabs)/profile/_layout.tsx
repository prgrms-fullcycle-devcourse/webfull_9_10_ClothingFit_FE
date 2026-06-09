import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="body" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile-image" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="followers" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="nickname" />
      <Stack.Screen name="fitting-history" />
      <Stack.Screen name="privacy-terms" />
      <Stack.Screen name="open-licenses" />
      <Stack.Screen name="user/[userId]" />
    </Stack>
  );
}
