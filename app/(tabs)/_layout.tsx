import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { fonts } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme].tint;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 10, marginBottom: 2 },
        // 아이콘+라벨이 안 잘리게 탭바 높이를 충분히 확보 (하단 safe-area 반영)
        tabBarStyle: {
          height: 66 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: '옷장',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wardrobe-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fitting"
        options={{
          title: 'AI 피팅',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center rounded-full ${focused ? 'bg-primary' : 'bg-gray-900'}`}
              style={{ width: 52, height: 52, marginBottom: 8 }}
            >
              <MaterialCommunityIcons name="hanger" size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          // AI 피팅 탭을 누르면 중간 메뉴 대신 바로 쇼핑몰 COPY(웹뷰)로 이동
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('/(tabs)/explore');
          },
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          // 웹뷰 COPY 화면에서는 하단 탭 바 숨김
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
