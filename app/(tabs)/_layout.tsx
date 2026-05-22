import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="fitting"
        options={{
          title: '피팅',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'tshirt', android: 'checkroom', web: 'checkroom' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '쇼핑',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: '피드',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }} tintColor={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person', android: 'person', web: 'person' }} tintColor={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
