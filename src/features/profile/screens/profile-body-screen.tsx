import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getTabBarStyle } from '@/constants/tab-bar';
import { AvatarStep } from '@/features/auth/components/avatar-step';
import { BodyStep } from '@/features/auth/components/body-step';
import { toApiGender, type Gender } from '@/features/auth/constants/avatars';
import {
  INITIAL_FORM,
  bodyInfoToForm,
  formToBodyInput,
  validateBody,
  type FieldKey,
} from '@/features/auth/constants/body-fields';
import { useAvatarImage } from '@/features/auth/hooks/use-avatar-image';
import {
  useCharacters,
  useSelectCharacter,
  type GroupedCharacters,
} from '@/features/characters/api';
import { useBodyInfo, useUpdateBodyInfo, useUpdateGender } from '@/features/profile/api';
import { cn } from '@/utils/cn';

type Tab = 'body' | 'avatar';

/** 체형 정보 수정 화면. [체형 정보] 탭과 [아바타](캐릭터 선택·사진) 탭을 제공한다. */
export function ProfileBodyScreen() {
  const bodyInfo = useBodyInfo();
  const updateBodyInfo = useUpdateBodyInfo();
  const selectCharacter = useSelectCharacter();
  const updateGender = useUpdateGender();
  const avatarImage = useAvatarImage();

  // 하단 탭 바가 '저장' 버튼을 가리므로 이 화면에선 탭 바를 숨긴다 (떠날 때 복원).
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: getTabBarStyle(insets) });
  }, [navigation, insets]);

  // "나의 AI 모델" 진입 시 ?tab=avatar 로 아바타 탭을 바로 연다 (없으면 체형 정보 탭).
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'avatar' ? 'avatar' : 'body');
  const [form, setForm] = useState<Record<FieldKey, string>>(INITIAL_FORM);
  const [gender, setGender] = useState<Gender>('male');
  // 사용자가 이 화면에서 직접 고른 캐릭터. null이면 아바타를 건드리지 않는다
  // (체형 정보만 저장할 때 기존 아바타/사진을 그대로 유지하기 위함).
  const [characterId, setCharacterId] = useState<string | null>(null);

  // 성별로 그룹핑된 캐릭터 목록 (배포 응답은 { MALE, FEMALE } flat 형태)
  const charactersQuery = useCharacters({
    query: { select: (res) => res as unknown as GroupedCharacters },
  });
  const characters = charactersQuery.data?.[toApiGender[gender]] ?? [];

  // 현재 체형 정보를 기본값으로 채움 (null/미입력은 빈칸)
  useEffect(() => {
    if (bodyInfo.data) setForm(bodyInfoToForm(bodyInfo.data));
  }, [bodyInfo.data]);

  // 사진을 올렸으면 캐릭터 대신 사진을 아바타로 사용 (백엔드는 캐릭터/사진이 상호배타적)
  const usePhoto = avatarImage.localUri !== null;

  const changeInput = (key: FieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 캐릭터를 고르면 사진 모드를 해제
  const handleSelectCharacter = (id: string) => {
    avatarImage.reset();
    setCharacterId(id);
  };

  const canSave = form.height.trim() !== '' && form.weight.trim() !== '';
  const saving = updateBodyInfo.isPending || selectCharacter.isPending || updateGender.isPending;

  const handleSave = async () => {
    const error = validateBody(form);
    if (error) {
      Alert.alert('입력 확인', error);
      return;
    }
    try {
      await updateBodyInfo.mutateAsync({ data: formToBodyInput(form) });
      // 사진은 선택 즉시 이미 반영됨(PATCH /avatar/image). 캐릭터는 사용자가 이 화면에서
      // 명시적으로 골랐을 때만 적용해 기존 아바타를 보존한다.
      if (!usePhoto && characterId) {
        await selectCharacter.mutateAsync({ data: { characterId } });
        // 성별은 어느 쪽(남/여) 캐릭터를 골랐는지로 결정 → 선택한 탭 기준으로 함께 갱신.
        await updateGender.mutateAsync({ data: { gender: toApiGender[gender] } });
      }
      Alert.alert('저장 완료', '체형 정보가 수정되었어요.');
      router.back();
    } catch (e: any) {
      const validationMsg = e?.response?.status === 400 ? e?.response?.data?.message : undefined;
      Alert.alert('저장 실패', validationMsg ?? '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenShell title="체형 정보 수정" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-4 pb-8 gap-4">
        {bodyInfo.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : bodyInfo.isError ? (
          <View className="flex-1 items-center justify-center">
            <Text variant="caption">
              체형 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
            </Text>
          </View>
        ) : (
          <>
            {/* 탭: 체형 정보 / 아바타 */}
            <View className="flex-row self-center rounded-full bg-surface p-1">
              {(['body', 'avatar'] as Tab[]).map((t) => {
                const active = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    className={cn('rounded-full px-8 py-2', active && 'bg-primary')}
                  >
                    <Text className={cn('font-sans-medium', active ? 'text-white' : 'text-muted')}>
                      {t === 'body' ? '체형 정보' : '아바타'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tab === 'body' ? (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-4 pb-2"
                keyboardShouldPersistTaps="handled"
              >
                <BodyStep form={form} changeInput={changeInput} />
              </ScrollView>
            ) : (
              <AvatarStep
                gender={gender}
                characters={characters}
                selectedId={usePhoto ? null : characterId}
                isLoading={charactersQuery.isLoading}
                isError={charactersQuery.isError}
                uploadedUri={avatarImage.localUri}
                isUploading={avatarImage.isUploading}
                onChangeGender={setGender}
                onSelectId={handleSelectCharacter}
                onPickAlbum={avatarImage.pickFromLibrary}
                onPickCamera={avatarImage.takePhoto}
              />
            )}

            {/* 체형 정보 탭에선 '다음'(아바타 탭으로 이동), 아바타 탭에선 '저장' */}
            {tab === 'body' ? (
              <Button
                label="다음"
                variant="primary"
                disabled={!canSave}
                onPress={() => setTab('avatar')}
                className="mt-auto"
              />
            ) : (
              <Button
                label={saving ? '저장 중...' : '저장'}
                variant="primary"
                disabled={!canSave || saving || avatarImage.isUploading}
                onPress={handleSave}
                className="mt-auto"
              />
            )}
          </>
        )}
      </View>
    </ScreenShell>
  );
}
