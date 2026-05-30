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
};

export function ScreenShell({
  title = '',
  showBack = true,
  right,
  children,
  className,
  noHeader,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {!noHeader && <ScreenHeader title={title} showBack={showBack} right={right} />}
      <SafeAreaView className={cn('flex-1', className)} edges={['bottom']}>
        {children}
      </SafeAreaView>
    </SafeAreaView>
  );
}
