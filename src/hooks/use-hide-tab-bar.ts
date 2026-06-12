import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTabBarStyle } from '@/constants/tab-bar';

export function useHideTabBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => parent?.setOptions({ tabBarStyle: getTabBarStyle(insets) });
    }, [navigation, insets]),
  );
}
