import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@/lib/query-client';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>{children}</KeyboardProvider>
    </QueryClientProvider>
  );
}
