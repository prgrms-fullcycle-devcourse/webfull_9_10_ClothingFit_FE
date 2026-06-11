import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { BottomSheet } from '@/features/webview/components/bottom-sheet';

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
      <Text variant="label" className="mb-1.5">
        코디 이름
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="이름을 입력해주세요"
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
