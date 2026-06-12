import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';
import { getTabBarStyle, TAB_BAR_BASE_HEIGHT } from '@/constants/tab-bar';
import { tabBarHidden, useTabBarVisible } from '@/features/navigation/tab-bar-store';
import { useNotificationsStream } from '@/features/notifications/use-notifications-stream';

/** 스크롤에 따라 아래로 슬라이드되는 커스텀 탭 바 (floating). 하위 화면에선 아예 숨김. */
function AnimatedTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visible = useTabBarVisible();
  // 가운데 버튼이 바 위로 튀어나와 있어, 숨길 땐 그 돌출분(약 80)까지 더 내려야 완전히 사라진다.
  const hideDistance = TAB_BAR_BASE_HEIGHT + insets.bottom + 80;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tabBarHidden.value * hideDistance }],
  }));
  if (!visible) return null;
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0 }, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // 앱 전역에서 1개 SSE 연결 유지 → 새 알림 도착 시 홈/마이 뱃지가 실시간 갱신됨
  useNotificationsStream();

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 10, marginBottom: 2 },
        // 아이콘+라벨이 안 잘리게 탭바 높이를 충분히 확보 (하단 safe-area 반영)
        tabBarStyle: getTabBarStyle(insets),
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
          // 가운데 버튼: 크게 + 위로 띄워(floating) 바 위로 튀어나오게 + 흰 링
          tabBarIcon: () => (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#1f2937',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -64,
                borderWidth: 3,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 6,
              }}
            >
              <MaterialCommunityIcons name="hanger" size={38} color="#fff" />
            </View>
          ),
          // 라벨은 떠있는 버튼 아래로 내려 다른 라벨과 같은 높이로
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontFamily: fonts.medium, fontSize: 10, marginTop: -8 }}>
              AI 피팅
            </Text>
          ),
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
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('/(tabs)/feed');
          },
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
        listeners={{
          // 알림 등 프로필 하위 화면이 스택에 남아있어도, 탭을 누르면 항상 마이페이지(index)로
          tabPress: (e) => {
            e.preventDefault();
            router.navigate('/(tabs)/profile');
          },
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
