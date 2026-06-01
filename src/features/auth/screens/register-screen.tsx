import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { AvatarStep } from '@/features/auth/components/avatar-step';
import { BodyStep } from '@/features/auth/components/body-step';
import { StepDots } from '@/features/auth/components/step-dots';
import { AVATARS, type Gender } from '@/features/auth/constants/avatars';
import { INITIAL_FORM, type FieldKey } from '@/features/auth/constants/body-fields';
import { type Step } from '@/features/auth/constants/steps';

export function RegisterScreen() {
  const [step, setStep] = useState<Step>('body');
  const [form, setForm] = useState(INITIAL_FORM);
  const [gender, setGender] = useState<Gender>('male');
  const [avatarId, setAvatarId] = useState(AVATARS.male[0].id);

  const changeInput = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const changeGender = (next: Gender) => {
    setGender(next);
    setAvatarId(AVATARS[next][0].id); // 성별 바뀌면 첫 체형으로
  };

  const canSubmit = form.height.trim() !== '' && form.weight.trim() !== '';

  const handleSubmit = () => {
    // TODO: 신체 정보 + 아바타 저장 API 연동 ({ ...form, gender, avatarId })
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenShell title="체형 등록" right={<StepDots step={step} />}>
      <View className="flex-1 px-6 pt-4 pb-8 gap-4">
        {step === 'body' ? (
          <BodyStep form={form} changeInput={changeInput} />
        ) : (
          <AvatarStep
            gender={gender}
            selectedId={avatarId}
            onChangeGender={changeGender}
            onSelectId={setAvatarId}
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
          <Button label="등록 완료" variant="primary" onPress={handleSubmit} className="mt-auto" />
        )}
      </View>
    </ScreenShell>
  );
}
