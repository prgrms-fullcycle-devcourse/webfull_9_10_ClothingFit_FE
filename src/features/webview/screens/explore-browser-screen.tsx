import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { CATEGORIES } from '@/features/webview/constants/categories';
import { MALLS } from '@/features/webview/constants/malls';
import { useCopySession } from '@/features/webview/hooks/use-copy-session';

export function ExploreBrowserScreen() {
  const { session, selectCategory, markCategoryDone, clearCategory, resetSession } =
    useCopySession('29cm');

  const mall = MALLS.find((m) => m.id === session.mallId) ?? MALLS[0];

  return (
    <ScreenShell title="WebView COPY" showBack>
      <View className="flex-row px-2 py-2 gap-2 border-b border-border">
        {MALLS.map((m) => (
          <Pressable
            key={m.id}
            className={`px-3 py-2 rounded-full ${session.mallId === m.id ? 'bg-primary' : 'bg-surface'}`}
            onPress={() => resetSession(m.id)}>
            <Text className={session.mallId === m.id ? 'text-white text-xs' : 'text-xs'}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row items-center px-3 py-2 border-b border-border">
        <Text variant="caption" className="flex-1" numberOfLines={1}>
          {mall.homeUrl}
        </Text>
      </View>

      <View className="flex-1 flex-row">
        <View className="flex-1 bg-gray-200 items-center justify-center m-2 rounded-xl">
          <Text variant="caption" className="text-center px-4">
            WebView 영역 (TODO){'\n'}실제 쇼핑몰 + inject 스크래핑
          </Text>
        </View>

        {session.sidebarVisible && (
          <View className="w-14 bg-gray-900 py-3 items-center gap-3">
            {CATEGORIES.map((cat) => {
              const done = session.slots[cat.id].status === 'done';
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => (done ? clearCategory(cat.id) : selectCategory(cat.id))}
                  className={`items-center ${session.activeCategory === cat.id ? 'opacity-100' : 'opacity-70'}`}>
                  <View
                    className={`w-10 h-10 rounded-lg border-2 items-center justify-center ${done ? 'border-green-400' : 'border-white'}`}>
                    <Text className="text-white text-[10px] font-sans-medium">{cat.label[0]}</Text>
                  </View>
                  {done && <Text className="text-green-400 text-[8px]">✓</Text>}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-2 p-3 border-t border-border bg-white">
        <Button label="COPY" className="flex-1" onPress={() => router.push('/(tabs)/explore/crop')} />
        <Button
          label="SAVE"
          variant="secondary"
          className="flex-1"
          onPress={() => router.push('/(tabs)/fitting/confirm')}
        />
        <Button label="취소" variant="ghost" className="px-3" onPress={() => resetSession()} />
      </View>
    </ScreenShell>
  );
}
