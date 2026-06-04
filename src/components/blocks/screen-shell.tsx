import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { cn } from '@/utils/cn';

type ScreenShellProps = {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noHeader?: boolean;
  /** 뒤로가기 동작 커스텀 (없으면 router.back()) */
  onBack?: () => void;
};

export function ScreenShell({
  title = '',
  showBack = true,
  right,
  children,
  className,
  noHeader,
  onBack,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {!noHeader && (
        <ScreenHeader title={title} showBack={showBack} right={right} onBack={onBack} />
      )}
      <View className={cn('flex-1', className)}>{children}</View>
    </SafeAreaView>
  );
}
