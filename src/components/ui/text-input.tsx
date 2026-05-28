import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { cn } from '@/utils/cn';

export function TextInput({ className, style, ...props }: TextInputProps) {
  return (
    <RNTextInput
      className={cn('font-sans text-primary', className)}
      style={style}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
