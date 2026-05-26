import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { fonts } from '@/constants/theme';
import { cn } from '@/utils/cn';

export function TextInput({ className, style, ...props }: TextInputProps) {
  return (
    <RNTextInput
      className={cn('font-sans text-primary', className)}
      style={[{ fontFamily: fonts.regular }, style]}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
