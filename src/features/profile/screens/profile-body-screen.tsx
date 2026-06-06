import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BodyStep } from '@/features/auth/components/body-step';
import {
  INITIAL_FORM,
  bodyInfoToForm,
  formToBodyInput,
  validateBody,
  type FieldKey,
} from '@/features/auth/constants/body-fields';
import { useBodyInfo, useUpdateBodyInfo } from '@/features/profile/api';

export function ProfileBodyScreen() {
  const bodyInfo = useBodyInfo();
  const updateBodyInfo = useUpdateBodyInfo();
  const [form, setForm] = useState<Record<FieldKey, string>>(INITIAL_FORM);

  // 현재 체형 정보를 기본값으로 채움 (null/미입력은 빈칸)
  useEffect(() => {
    if (bodyInfo.data) setForm(bodyInfoToForm(bodyInfo.data));
  }, [bodyInfo.data]);

  const changeInput = (key: FieldKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSave = form.height.trim() !== '' && form.weight.trim() !== '';

  const handleSave = async () => {
    const error = validateBody(form);
    if (error) {
      Alert.alert('입력 확인', error);
      return;
    }
    try {
      await updateBodyInfo.mutateAsync({ data: formToBodyInput(form) });
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
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="gap-4 pb-2"
              keyboardShouldPersistTaps="handled"
            >
              <BodyStep form={form} changeInput={changeInput} />
            </ScrollView>
            <Button
              label={updateBodyInfo.isPending ? '저장 중...' : '저장'}
              variant="primary"
              disabled={!canSave || updateBodyInfo.isPending}
              onPress={handleSave}
              className="mt-auto"
            />
          </>
        )}
      </View>
    </ScreenShell>
  );
}
