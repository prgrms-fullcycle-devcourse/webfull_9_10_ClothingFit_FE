import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fonts } from '@/constants/theme';
import { cn } from '@/utils/cn';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

const variantClass: Record<Variant, string> = {
  title: 'text-2xl font-sans-bold text-primary',
  subtitle: 'text-lg font-sans-medium text-primary',
  body: 'text-base font-sans text-primary',
  caption: 'text-sm font-sans text-muted',
  label: 'text-xs font-sans-medium text-muted',
};

export type AppTextProps = RNTextProps & {
  variant?: Variant;
  className?: string;
};

const variantFont: Record<Variant, string> = {
  title: fonts.bold,
  subtitle: fonts.medium,
  body: fonts.regular,
  caption: fonts.regular,
  label: fonts.medium,
};

export function Text({ variant = 'body', className, style, ...props }: AppTextProps) {
  return (
    <RNText
      className={cn(variantClass[variant], className)}
      style={[{ fontFamily: variantFont[variant] }, style]}
      {...props}
    />
  );
}
