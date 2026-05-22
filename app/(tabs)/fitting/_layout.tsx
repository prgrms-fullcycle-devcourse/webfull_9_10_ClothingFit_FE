import { Stack } from 'expo-router';

export default function FittingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '피팅' }} />
      <Stack.Screen name="start" options={{ title: '피팅 시작' }} />
      <Stack.Screen name="[jobId]" options={{ title: '피팅 진행' }} />
      <Stack.Screen name="viewer-3d" options={{ title: '3D 뷰어', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
