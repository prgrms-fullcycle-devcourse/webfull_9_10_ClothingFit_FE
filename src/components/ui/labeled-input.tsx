import { forwardRef } from 'react';
import { View, type TextInput as RNTextInput, type TextInputProps } from 'react-native';

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

export const LabeledInput = forwardRef<RNTextInput, LabeledInputProps>(function LabeledInput(
  { label, required, containerClassName, className, ...props },
  ref,
) {
  return (
    <View className={cn('gap-2', containerClassName)}>
      <Text variant="label" className="text-base">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        ref={ref}
        // text-lg(=fontSize+lineHeight 동시 지정) 대신 fontSize만 지정.
        // 한글 폰트에서 강제 lineHeight가 글리프를 클리핑해 입력 안 텍스트가 세로 스크롤되는 것 방지.
        className={cn('border border-border rounded-xl px-4 py-4', className)}
        style={{ fontSize: 18 }}
        {...props}
      />
    </View>
  );
});
