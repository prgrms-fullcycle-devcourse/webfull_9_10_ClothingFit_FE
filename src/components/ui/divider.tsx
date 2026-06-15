import { View } from 'react-native';

import { cn } from '@/utils/cn';

type Props = {
  thickness?: number;
  className?: string;
};

export function Divider({ thickness = 1, className }: Props) {
  return <View style={{ height: thickness }} className={cn('bg-border w-full', className)} />;
}
