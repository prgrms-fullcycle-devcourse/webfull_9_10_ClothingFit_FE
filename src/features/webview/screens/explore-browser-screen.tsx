import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { PlaceholderScreen } from '@/components/blocks/placeholder-screen';
import { Text, View } from '@/components/Themed';

/** ①~⑥ WebView COPY 메인 — mall-selector, sidebar, COPY/SAVE 바 구현 예정 */
export function ExploreBrowserScreen() {
  return (
    <View style={styles.container}>
      <PlaceholderScreen
        title="WebView COPY"
        description="① 몰 선택 ② URL ③ WebView ④ 카테고리 사이드바 ⑤ COPY ⑥ SAVE"
      />
      <Pressable style={styles.copyButton} onPress={() => router.push('/(tabs)/explore/crop')}>
        <Text style={styles.copyButtonText}>COPY (임시 → crop 화면)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  copyButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
