import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { BottomSheet } from '@/features/webview/components/bottom-sheet';

/** 코디 이름 최대 글자 수 */
const MAX_NAME = 7;

type Props = {
  visible: boolean;
  initialName?: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

/** 코디 이름 변경 바텀시트 (옷장 상세) */
export function RenameCoordiSheet({ visible, initialName, saving, onClose, onSubmit }: Props) {
  const [name, setName] = useState(initialName ?? '');

  // 열릴 때마다 현재 이름으로 초기화
  useEffect(() => {
    if (visible) setName(initialName ?? '');
  }, [visible, initialName]);

  const trimmed = name.trim();

  return (
    <BottomSheet visible={visible} title="코디 이름 변경" onClose={onClose}>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text variant="label">코디 이름</Text>
        <Text variant="label" className="text-muted">
          {name.length}/{MAX_NAME}
        </Text>
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={MAX_NAME}
        placeholder={`최대 ${MAX_NAME}글자까지 입력할 수 있어요`}
        className="border border-border rounded-xl px-4 py-3 mb-4"
        autoFocus
      />
      <Button
        label={saving ? '저장 중...' : '저장'}
        disabled={!trimmed || saving}
        onPress={() => onSubmit(trimmed)}
      />
    </BottomSheet>
  );
}
