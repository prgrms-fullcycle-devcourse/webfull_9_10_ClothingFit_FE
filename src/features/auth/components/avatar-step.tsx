import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import {
  BODY_TYPE_LABEL,
  GENDERS,
  fallbackImage,
  type Gender,
} from '@/features/auth/constants/avatars';
import type { Character } from '@/features/characters/api';
import { cn } from '@/utils/cn';

type AvatarStepProps = {
  gender: Gender;
  characters: Character[];
  selectedId: string | null;
  isLoading: boolean;
  isError: boolean;
  /** 업로드한 사진 미리보기 uri (있으면 캐릭터 대신 사진을 표시) */
  uploadedUri: string | null;
  isUploading: boolean;
  onChangeGender: (next: Gender) => void;
  onSelectId: (id: string) => void;
  onPickAlbum: () => void;
  onPickCamera: () => void;
};

export function AvatarStep({
  gender,
  characters,
  selectedId,
  isLoading,
  isError,
  uploadedUri,
  isUploading,
  onChangeGender,
  onSelectId,
  onPickAlbum,
  onPickCamera,
}: AvatarStepProps) {
  const selected = characters.find((c) => c.id === selectedId) ?? characters[0];

  return (
    <View className="flex-1 gap-4">
      {/* 성별 토글 */}
      <View className="flex-row self-center rounded-full bg-surface p-1">
        {GENDERS.map((g) => {
          const active = gender === g.value;
          return (
            <Pressable
              key={g.value}
              onPress={() => onChangeGender(g.value)}
              className={cn('rounded-full px-8 py-2', active && 'bg-primary')}
            >
              <Text className={cn('font-sans-medium', active ? 'text-white' : 'text-muted')}>
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 소스 버튼 + 캐릭터 썸네일 */}
      <View className="flex-row gap-3">
        <View className="gap-2">
          <SourceButton
            icon="image-outline"
            label="앨범"
            onPress={onPickAlbum}
            disabled={isUploading}
          />
          <SourceButton
            icon="camera-outline"
            label="사진 촬영"
            onPress={onPickCamera}
            disabled={isUploading}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-2"
        >
          {characters.map((c) => {
            const active = selectedId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => onSelectId(c.id)}
                className={cn(
                  'h-28 w-20 overflow-hidden rounded-xl border bg-surface',
                  active ? 'border-primary' : 'border-border',
                )}
              >
                <Image
                  source={c.imageUrl}
                  placeholder={fallbackImage(gender, c.bodyType)}
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

      {/* 큰 미리보기 / 상태 */}
      <View className="flex-1 rounded-2xl border border-border p-4">
        {isUploading ? (
          <View className="flex-1 items-center justify-center gap-2">
            <ActivityIndicator />
            <Text variant="caption">사진 업로드 중...</Text>
          </View>
        ) : uploadedUri ? (
          <>
            <Text variant="label" className="text-base">
              내 사진
            </Text>
            <Image
              source={uploadedUri}
              contentFit="contain"
              className="flex-1 w-full bg-transparent"
            />
          </>
        ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text variant="caption">캐릭터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
          </View>
        ) : selected ? (
          <>
            <Text variant="label" className="text-base">
              {BODY_TYPE_LABEL[selected.bodyType]}
            </Text>
            <Image
              source={selected.imageUrl}
              placeholder={fallbackImage(gender, selected.bodyType)}
              contentFit="contain"
              className="flex-1 w-full bg-transparent"
            />
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text variant="caption">표시할 캐릭터가 없어요.</Text>
          </View>
        )}
      </View>

      <Text variant="caption" className="text-center">
        업로드된 사진을 기반으로 ai모델을 생성합니다.
      </Text>
    </View>
  );
}

function SourceButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'h-[52px] w-16 items-center justify-center gap-1 rounded-xl bg-surface',
        disabled && 'opacity-50',
      )}
    >
      <Ionicons name={icon} size={20} color="#6a7282" />
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}
