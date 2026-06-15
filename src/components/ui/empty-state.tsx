import { type ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { Text } from './text';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, description, className, style }: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center gap-2 ${className ?? ''}`} style={style}>
      {icon}
      <View className="items-center gap-2">
        <Text variant="subtitle" className="text-muted text-center">
          {title}
        </Text>
        {description && (
          <Text variant="caption" className="text-center">
            {description}
          </Text>
        )}
      </View>
    </View>
  );
}
