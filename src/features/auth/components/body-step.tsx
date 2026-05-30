import { View } from 'react-native';

import { LabeledInput } from '@/components/ui/labeled-input';
import { Text } from '@/components/ui/text';
import { GIRTH_FIELDS, ROW_FIELDS, type FieldKey } from '@/features/auth/constants/body-fields';

type BodyStepProps = {
  form: Record<FieldKey, string>;
  changeInput: (key: FieldKey, value: string) => void;
};

export function BodyStep({ form, changeInput }: BodyStepProps) {
  // 신체 정보 입력 단계에서 사용
  return (
    <View className="gap-4">
      <Text variant="subtitle">몸 치수 등록</Text>

      <View className="flex-row gap-3">
        {ROW_FIELDS.map((f) => (
          <LabeledInput
            key={f.key}
            containerClassName="flex-1"
            label={f.label}
            required={f.required}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChangeText={(value) => changeInput(f.key, value)}
            keyboardType="number-pad"
            maxLength={3}
          />
        ))}
      </View>

      {GIRTH_FIELDS.map((f) => (
        <LabeledInput
          key={f.key}
          label={f.label}
          required={f.required}
          placeholder={f.placeholder}
          value={form[f.key]}
          onChangeText={(value) => changeInput(f.key, value)}
          keyboardType="number-pad"
          maxLength={3}
        />
      ))}
    </View>
  );
}
