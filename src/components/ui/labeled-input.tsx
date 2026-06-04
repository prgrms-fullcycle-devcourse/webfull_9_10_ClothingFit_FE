import { View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/utils/cn';

export type LabeledInputProps = TextInputProps & {
  label: string;
  /** 필수 입력이면 라벨 옆에 빨간 * 표시 */
  required?: boolean;
  /** 라벨+입력창을 감싸는 컨테이너 className (예: 'flex-1') */
  containerClassName?: string;
};

export function LabeledInput({
  label,
  required,
  containerClassName,
  className,
  ...props
}: LabeledInputProps) {
  return (
    <View className={cn('gap-2', containerClassName)}>
      <Text variant="label" className="text-base">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        className={cn('border border-border rounded-xl px-4 py-4 text-lg', className)}
        {...props}
      />
    </View>
  );
}
