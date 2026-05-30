import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

import { cn } from '@/utils/cn';

cssInterop(ExpoImage, { className: 'style' });

type Variant = 'avatar' | 'thumbnail' | 'cover' | 'icon' | 'logo';

const variantClass: Record<Variant, string> = {
  avatar: 'w-12 h-12 rounded-full',
  thumbnail: 'w-20 h-20 rounded-lg',
  cover: 'w-full aspect-[4/3] rounded-xl',
  icon: 'w-6 h-6',
  logo: 'w-32 h-32 self-center bg-transparent',
};

// 로고는 비율 유지(잘리지 않게), 그 외에는 영역을 꽉 채움
const variantContentFit: Partial<Record<Variant, ExpoImageProps['contentFit']>> = {
  logo: 'contain',
};

export type ImageProps = ExpoImageProps & {
  variant?: Variant;
  className?: string;
};

export function Image({ variant = 'thumbnail', className, ...props }: ImageProps) {
  return (
    <ExpoImage
      className={cn('bg-accent/20', variantClass[variant], className)}
      contentFit={variantContentFit[variant] ?? 'cover'}
      transition={200}
      {...props}
    />
  );
}
