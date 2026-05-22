import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'OOTD' }} />
      <Stack.Screen name="[postId]" options={{ title: '게시물' }} />
      <Stack.Screen name="create" options={{ title: '작성', presentation: 'modal' }} />
    </Stack>
  );
}
