import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { AvatarStep } from '@/features/auth/components/avatar-step';
import { BodyStep } from '@/features/auth/components/body-step';
import { StepDots } from '@/features/auth/components/step-dots';
import { toApiGender, type Gender } from '@/features/auth/constants/avatars';
import {
  INITIAL_FORM,
  formToBodyInput,
  validateBody,
  type FieldKey,
} from '@/features/auth/constants/body-fields';
import { type Step } from '@/features/auth/constants/steps';
import { useAvatarImage } from '@/features/auth/hooks/use-avatar-image';
import {
  useCharacters,
  useSelectCharacter,
  type GroupedCharacters,
} from '@/features/characters/api';
import { useUpdateBodyInfo } from '@/features/profile/api';

export function RegisterScreen() {
  const [step, setStep] = useState<Step>('body');
  const [form, setForm] = useState(INITIAL_FORM);
  const [gender, setGender] = useState<Gender>('male');
  const [characterId, setCharacterId] = useState<string | null>(null);

  // 성별로 그룹핑된 캐릭터 목록. 배포 응답은 { MALE, FEMALE } flat 형태(스펙의 { data } 래퍼와 다름)
  const charactersQuery = useCharacters({
    query: { select: (res) => res as unknown as GroupedCharacters },
  });
  const selectCharacter = useSelectCharacter();
  const updateBodyInfo = useUpdateBodyInfo();
  const avatarImage = useAvatarImage();

  // 사진 업로드 모드 여부 (사진을 올렸으면 캐릭터 선택 대신 사진을 아바타로 사용)
  const usePhoto = avatarImage.localUri !== null;

  const characters = charactersQuery.data?.[toApiGender[gender]] ?? [];

  // 캐릭터를 고르면 사진 모드를 해제 (백엔드는 캐릭터/사진이 상호배타적)
  const handleSelectCharacter = (id: string) => {
    avatarImage.reset();
    setCharacterId(id);
  };

  // 데이터 로드/성별 변경 시 해당 성별의 첫 캐릭터를 기본 선택
  useEffect(() => {
    const list = charactersQuery.data?.[toApiGender[gender]] ?? [];
    setCharacterId(list[0]?.id ?? null);
  }, [charactersQuery.data, gender]);

  const changeInput = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.height.trim() !== '' && form.weight.trim() !== '';

  const submitting = updateBodyInfo.isPending || selectCharacter.isPending;

  const handleSubmit = async () => {
    // 사진 업로드 모드면 사진(PATCH /avatar/image)이 이미 반영됨 → 캐릭터 선택은 생략
    if (!usePhoto && !characterId) return;
    const error = validateBody(form);
    if (error) {
      Alert.alert('입력 확인', error);
      return;
    }
    try {
      await updateBodyInfo.mutateAsync({ data: formToBodyInput(form) });
      if (!usePhoto && characterId) {
        await selectCharacter.mutateAsync({ data: { characterId } });
      }
      router.replace('/(tabs)/home');
    } catch (e: any) {
      // 서버가 400 검증 에러로 보낸 메시지는 사용자에게 노출(어느 값이 문제인지 안내), 그 외엔 일반 메시지
      const validationMsg = e?.response?.status === 400 ? e?.response?.data?.message : undefined;
      if (e?.response) {
        console.error('[register] 등록 실패', {
          status: e.response.status,
          url: e.config?.url,
          data: e.response.data,
        });
      }
      Alert.alert('등록 실패', validationMsg ?? '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenShell
      title="체형 등록"
      // 온보딩이므로 첫 단계(body)에선 뒤로가기를 숨겨 메인 탈출을 막고,
      // 두 번째 단계(avatar)에선 메인이 아니라 이전 단계(body)로 돌아가게 한다.
      // (register는 replace로 진입해 기본 router.back()이 루트 (tabs)=메인으로 가버림)
      showBack={step === 'avatar'}
      onBack={step === 'avatar' ? () => setStep('body') : undefined}
      right={<StepDots step={step} />}
      edges={['top', 'bottom']}
    >
      <View className="flex-1 px-6 pt-4 pb-8 gap-4">
        {step === 'body' ? (
          // 필드가 많아 화면이 짧으면 넘치므로 스크롤 처리 (하단 버튼 짤림 방지)
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

        {step === 'body' ? (
          <Button
            label="다음"
            variant="primary"
            disabled={!canSubmit}
            onPress={() => setStep('avatar')}
            className="mt-auto"
          />
        ) : (
          <Button
            label="등록 완료"
            variant="primary"
            disabled={(!usePhoto && !characterId) || submitting || avatarImage.isUploading}
            onPress={handleSubmit}
            className="mt-auto"
          />
        )}
      </View>
    </ScreenShell>
  );
}
