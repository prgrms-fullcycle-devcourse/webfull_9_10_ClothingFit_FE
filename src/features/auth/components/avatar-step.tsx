import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { AVATARS, GENDERS, type Gender } from '@/features/auth/constants/avatars';
import { cn } from '@/utils/cn';

export function AvatarStep() {
  const [gender, setGender] = useState<Gender>('male');
  const [selectedId, setSelectedId] = useState(AVATARS.male[0].id);

  const avatars = AVATARS[gender];
  const selected = avatars.find((a) => a.id === selectedId) ?? avatars[0];

  const changeGender = (next: Gender) => {
    setGender(next);
    setSelectedId(AVATARS[next][0].id); // 성별 바뀌면 첫 체형으로
  };

  return (
    <View className="flex-1 gap-4">
      {/* 성별 토글 */}
      <View className="flex-row self-center rounded-full bg-surface p-1">
        {GENDERS.map((g) => {
          const active = gender === g.value;
          return (
            <Pressable
              key={g.value}
              onPress={() => changeGender(g.value)}
              className={cn('rounded-full px-8 py-2', active && 'bg-primary')}
            >
              <Text className={cn('font-sans-medium', active ? 'text-white' : 'text-muted')}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 소스 버튼 + 아바타 썸네일 */}
      <View className="flex-row gap-3">
        <View className="gap-2">
          <SourceButton icon="image-outline" label="앨범" />
          <SourceButton icon="camera-outline" label="사진 촬영" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-2"
        >
          {avatars.map((a) => {
            const active = selectedId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setSelectedId(a.id)}
                className={cn(
                  'h-28 w-20 overflow-hidden rounded-xl border bg-surface',
                  active ? 'border-primary' : 'border-border',
                )}
              >
                <Image
                  source={a.source}
                  contentFit="contain"
                  className="w-full h-full bg-transparent"
                />
                {active && (
                  <View className="absolute right-1 top-1">
                    <Ionicons name="checkmark-circle" size={18} color="#111827" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 큰 미리보기 */}
      <View className="flex-1 rounded-2xl border border-border p-4">
        <Text variant="label" className="text-base">
          {selected.label}
        </Text>
        <Image
          source={selected.source}
          contentFit="contain"
          className="flex-1 w-full bg-transparent"
        />
      </View>

      <Text variant="caption" className="text-center">
        업로드된 사진을 기반으로 ai모델을 생성합니다.
      </Text>
    </View>
  );
}

function SourceButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Pressable className="h-[52px] w-16 items-center justify-center gap-1 rounded-xl bg-surface">
      <Ionicons name={icon} size={20} color="#6a7282" />
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}
