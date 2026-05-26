import { Pressable, type PressableProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-accent',
  ghost: 'bg-transparent border border-border',
  danger: 'bg-red-500',
};

const labelClass: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  ghost: 'text-primary',
  danger: 'text-white',
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  className?: string;
};

export function Button({ label, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'rounded-xl px-4 py-3 items-center justify-center',
        variantClass[variant],
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      {...props}>
      <Text className={cn('font-sans-medium', labelClass[variant])}>{label}</Text>
    </Pressable>
  );
}
