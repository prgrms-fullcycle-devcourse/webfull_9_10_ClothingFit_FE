import { Stack } from 'expo-router';

export default function FittingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="[jobId]" />
      <Stack.Screen name="result" />
      <Stack.Screen name="viewer-3d" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
