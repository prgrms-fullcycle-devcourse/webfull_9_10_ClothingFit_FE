import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* confirm 화면은 자체 ScreenShell 헤더를 쓰므로 Stack 기본 헤더 숨김 (이중 헤더 방지) */}
      <Stack.Screen name="confirm" options={{ headerShown: false }} />
      <Stack.Screen
        name="crop"
        options={{ title: '의류 영역 선택', presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}
