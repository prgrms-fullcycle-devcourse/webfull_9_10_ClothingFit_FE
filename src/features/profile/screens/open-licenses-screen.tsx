import { ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Text } from '@/components/ui/text';

// 주요 오픈소스 라이선스 (대부분 MIT). 필요 시 전체 목록으로 확장.
const LICENSES: { name: string; license: string }[] = [
  { name: 'react', license: 'MIT' },
  { name: 'react-native', license: 'MIT' },
  { name: 'expo', license: 'MIT' },
  { name: 'expo-router', license: 'MIT' },
  { name: '@tanstack/react-query', license: 'MIT' },
  { name: 'axios', license: 'MIT' },
  { name: 'nativewind', license: 'MIT' },
  { name: 'react-native-sse', license: 'MIT' },
  { name: 'expo-image-picker', license: 'MIT' },
  { name: 'expo-secure-store', license: 'MIT' },
  { name: '@react-native-google-signin/google-signin', license: 'MIT' },
  { name: '@react-native-kakao/core', license: 'MIT' },
];

/** 오픈 라이선스 화면. 주요 오픈소스 패키지와 라이선스 목록을 표시한다. */
export function OpenLicensesScreen() {
  return (
    <ScreenShell title="오픈 라이선스">
      <ScrollView className="flex-1 px-5" contentContainerClassName="py-2">
        {LICENSES.map((l) => (
          <View
            key={l.name}
            className="flex-row items-center justify-between border-b border-border py-3"
          >
            <Text className="flex-1 pr-3">{l.name}</Text>
            <Text variant="caption">{l.license}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
