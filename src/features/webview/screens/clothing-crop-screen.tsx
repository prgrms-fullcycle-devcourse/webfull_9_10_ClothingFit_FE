import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { PlaceholderScreen } from '@/components/blocks/placeholder-screen';
import { Text, View } from '@/components/Themed';

/** 영역 선택 + ✓ — 스크래핑·BE 전송 로직은 use-scrape-on-copy 등에 구현 예정 */
export function ClothingCropScreen() {
  return (
    <View style={styles.container}>
      <PlaceholderScreen title="의류 영역 선택" description="드래그 박스 + 카테고리별 DOM 스크래핑" />
      <Pressable style={styles.confirmButton} onPress={() => router.back()}>
        <Text style={styles.confirmText}>✓ (임시 — 메인으로 복귀)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
