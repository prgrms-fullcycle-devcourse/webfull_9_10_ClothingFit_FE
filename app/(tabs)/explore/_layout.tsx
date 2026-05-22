import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="crop" options={{ title: '의류 영역 선택', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
