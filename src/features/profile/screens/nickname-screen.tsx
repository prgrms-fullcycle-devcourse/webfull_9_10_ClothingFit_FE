import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { checkNickname, useProfile, useUpdateNickname } from '@/features/profile/api';

/** 닉네임 변경 화면. 현재 닉네임을 불러와 중복확인 후 변경(PATCH /profile/nickname)한다. */
export function NicknameScreen() {
  const qc = useQueryClient();
  const profile = useProfile();
  const update = useUpdateNickname();

  const [value, setValue] = useState('');
  const [checking, setChecking] = useState(false);
  // null=미확인, true=사용가능, false=중복
  const [available, setAvailable] = useState<boolean | null>(null);

  // 현재 닉네임을 기본값으로 채움
  useEffect(() => {
    if (profile.data?.nickname) setValue(profile.data.nickname);
  }, [profile.data?.nickname]);

  const onChange = (text: string) => {
    setValue(text);
    setAvailable(null); // 닉네임이 바뀌면 중복확인 결과 초기화
  };

  const handleCheck = async () => {
    const nickname = value.trim();
    if (!nickname) {
      Alert.alert('닉네임 확인', '닉네임을 입력해 주세요.');
      return;
    }
    setChecking(true);
    try {
      const res = await checkNickname({ nickname });
      setAvailable(res.available);
    } catch {
      Alert.alert('확인 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (available !== true) {
      Alert.alert('중복확인 필요', '닉네임 중복확인을 먼저 해주세요.');
      return;
    }
    try {
      await update.mutateAsync({ data: { nickname: value.trim() } });
      qc.invalidateQueries({ queryKey: ['/profile'] });
      Alert.alert('변경 완료', '닉네임이 변경되었어요.');
      router.back();
    } catch (e: any) {
      const msg = e?.response?.status === 400 ? e?.response?.data?.message : undefined;
      Alert.alert('변경 실패', msg ?? '잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenShell title="닉네임 변경">
      <View className="flex-1 p-4">
        <Text variant="label" className="mb-2">
          변경할 닉네임
        </Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="닉네임 입력"
          className="border border-border rounded-xl px-4 py-3 mb-3"
        />
        <Button
          label={checking ? '확인 중...' : '중복확인'}
          variant="ghost"
          className="mb-3"
          onPress={handleCheck}
          disabled={checking}
        />
        {available !== null && (
          <Text
            variant="caption"
            className={`mb-6 ${available ? 'text-green-600' : 'text-red-500'}`}
          >
            {available
              ? '사용 가능한 닉네임입니다. 변경하기를 눌러주세요.'
              : '이미 사용 중인 닉네임입니다.'}
          </Text>
        )}
        <Button
          label={update.isPending ? '변경 중...' : '변경하기'}
          variant="secondary"
          onPress={handleSubmit}
          disabled={available !== true || update.isPending}
        />
      </View>
    </ScreenShell>
  );
}
