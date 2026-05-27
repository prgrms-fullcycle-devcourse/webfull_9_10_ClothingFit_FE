import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';

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

  // 접힌 상태: 활성 카테고리(없으면 첫 카테고리) 1개 + < 토글
  if (!sidebarVisible) {
    const visibleCat = activeCategory
      ? CATEGORIES.find((c) => c.id === activeCategory)
      : CATEGORIES[0];
    const slot = visibleCat ? slots[visibleCat.id] : undefined;

    return (
      <View className="absolute right-2 top-3 flex-row items-start gap-1" pointerEvents="box-none">
        <Pressable
          onPress={onToggle}
          hitSlop={6}
          className="bg-white rounded-l-xl py-2 px-1 border border-gray-200 shadow"
        >
          <Ionicons name="chevron-back" size={18} color="#111827" />
        </Pressable>
        {visibleCat && (
          <Pressable
            onPress={onToggle}
            className="w-14 h-14 rounded-xl bg-white border-2 border-primary items-center justify-center overflow-hidden shadow"
          >
            {slot?.imageUri ? (
              <Image source={{ uri: slot.imageUri }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-[10px] font-sans-medium">{visibleCat.label}</Text>
            )}
          </Pressable>
        )}
      </View>
    );
  }

  // 펼친 상태: 카테고리 5개 + 생성
  return (
    <View
      className="absolute right-2 top-3 bottom-3 flex-row items-start gap-1"
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onToggle}
        hitSlop={6}
        className="bg-white rounded-l-xl py-2 px-1 border border-gray-200 mt-1 shadow"
      >
        <Ionicons name="chevron-forward" size={18} color="#111827" />
      </Pressable>

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
    </View>
  );
}
