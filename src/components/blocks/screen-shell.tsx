import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

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
  /**
   * 적용할 SafeArea 가장자리. 기본은 상단만('top') — 하단은 탭바가 처리.
   * 탭바가 없고 하단에 콘텐츠/버튼이 붙는 화면(예: 로그인·회원가입)은 ['top','bottom'] 사용.
   */
  edges?: readonly Edge[];
};

export function ScreenShell({
  title = '',
  showBack = true,
  right,
  children,
  className,
  noHeader,
  onBack,
  edges = ['top'],
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={edges}>
      {!noHeader && (
        <ScreenHeader title={title} showBack={showBack} right={right} onBack={onBack} />
      )}
      <View className={cn('flex-1', className)}>{children}</View>
    </SafeAreaView>
  );
}
