import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Vibration, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

import { CATEGORIES, type CategoryId } from '../constants/categories';
import type { CopySession } from '../types/copy-session';

type CategorySidebarProps = {
  session: CopySession;
  /** 사이드바 전체 펼침 토글 */
  onToggle: () => void;
  /** 카테고리 탭 (delete 모드일 때는 삭제, 평상시에는 활성화) */
  onCategoryPress: (categoryId: CategoryId) => void;
  /** 생성 버튼 */
  onGenerate: () => void;
  canGenerate: boolean;
};

export function CategorySidebar({
  session,
  onToggle,
  onCategoryPress,
  onGenerate,
  canGenerate,
}: CategorySidebarProps) {
  const { sidebarVisible, activeCategory, slots, deleteMode } = session;

  // 접힌 버튼 위아래 드래그(꾹 누르면 활성). 영역 안으로 위치 제한.
  const dragY = useSharedValue(0);
  const startY = useSharedValue(0);
  const areaH = useSharedValue(0);
  const scale = useSharedValue(1); // 드래그 활성 시 살짝 확대
  const buzz = () => Vibration.vibrate(15); // 활성 순간 짧은 진동
  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      startY.value = dragY.value;
      scale.value = withTiming(1.15, { duration: 120 }); // 살짝 커지는 효과
      runOnJS(buzz)();
    })
    .onUpdate((e) => {
      const limit = areaH.value / 8; // 위아래 합쳐 areaH/4 (화면 높이의 1/4)만 이동
      const next = startY.value + e.translationY;
      dragY.value = Math.min(limit, Math.max(-limit, next));
    })
    .onFinalize(() => {
      scale.value = withTiming(1, { duration: 120 }); // 원래 크기로 복귀
    });
  const tapGesture = Gesture.Tap().onEnd(() => runOnJS(onToggle)());
  const buttonGesture = Gesture.Exclusive(dragGesture, tapGesture);
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }, { scale: scale.value }],
  }));

  // 접힌 상태: 토글 버튼(<)만. 우측 세로 중앙. 꾹 누르면 위아래 드래그.
  if (!sidebarVisible) {
    return (
      <View
        className="absolute right-0 top-0 bottom-0 justify-center"
        pointerEvents="box-none"
        onLayout={(e) => {
          areaH.value = e.nativeEvent.layout.height;
        }}
      >
        <GestureDetector gesture={buttonGesture}>
          <Animated.View
            style={dragStyle}
            className="bg-white rounded-l-xl py-2.5 px-1 border border-gray-200 shadow items-center"
          >
            <Ionicons name="chevron-back" size={18} color="#111827" />
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }

  // 펼친 상태: 토글 버튼 + 카테고리 5개 + 생성. 우측 세로 중앙에 고정.
  return (
    <View
      className="absolute right-0 top-0 bottom-0 justify-center items-end"
      pointerEvents="box-none"
      onLayout={(e) => {
        areaH.value = e.nativeEvent.layout.height;
      }}
    >
      {/* 드래그 위치(translateY)를 펼친 사이드바에도 동일 적용 → 버튼 위치에 맞춰 열림 */}
      <Animated.View style={dragStyle} className="flex-row items-center">
        <GestureDetector gesture={buttonGesture}>
          <Animated.View className="bg-white rounded-l-xl py-2 px-1 border border-gray-200 shadow items-center">
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </Animated.View>
        </GestureDetector>

        <View className="w-16 bg-white rounded-2xl border border-gray-200 p-1.5 gap-1.5 shadow">
          {CATEGORIES.map((cat) => {
            const slot = slots[cat.id];
            const filled = slot.status === 'done';
            const isActive = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => onCategoryPress(cat.id)}
                className={cn(
                  'h-12 rounded-xl border items-center justify-center bg-white overflow-hidden',
                  isActive ? 'border-2 border-primary' : 'border-gray-200',
                  deleteMode && filled && 'border-red-500',
                )}
              >
                {filled && slot.imageUri ? (
                  <>
                    <Image
                      source={{ uri: slot.imageUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    {deleteMode && (
                      <View className="absolute inset-0 items-center justify-center bg-black/40">
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </View>
                    )}
                  </>
                ) : (
                  <Text className="text-[10px] font-sans-medium text-gray-700">{cat.label}</Text>
                )}
              </Pressable>
            );
          })}

          {/* 생성 버튼 */}
          <Pressable
            onPress={onGenerate}
            disabled={!canGenerate}
            className={cn(
              'h-10 rounded-xl items-center justify-center mt-1',
              canGenerate ? 'bg-primary' : 'bg-gray-300',
            )}
          >
            <Text className="text-white text-xs font-sans-bold">생성</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
