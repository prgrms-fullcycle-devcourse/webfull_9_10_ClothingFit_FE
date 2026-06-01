import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

type Provider = 'kakao' | 'google';

type ProviderConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  containerClass: string;
  /** 아이콘·라벨 색 (hex) */
  symbolColor: string;
};

const providerConfig: Record<Provider, ProviderConfig> = {
  kakao: {
    label: '카카오 로그인',
    icon: 'chatbubble',
    containerClass: 'bg-[#FEE500]',
    symbolColor: '#000000',
  },
  google: {
    label: 'Google 로그인',
    icon: 'logo-google',
    containerClass: 'bg-white border border-border',
    symbolColor: '#1F1F1F',
  },
};

export type SocialButtonProps = PressableProps & {
  provider: Provider;
  className?: string;
};

export function SocialButton({ provider, className, disabled, ...props }: SocialButtonProps) {
  const { label, icon, containerClass, symbolColor } = providerConfig[provider];

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-center gap-3 rounded-xl px-5 py-4',
        containerClass,
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <Ionicons name={icon} size={22} color={symbolColor} />
      <Text className="text-lg font-sans-medium" style={{ color: symbolColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
