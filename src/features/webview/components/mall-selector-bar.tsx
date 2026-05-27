import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

import { MALLS, type MallId } from '../constants/malls';

type MallSelectorBarProps = {
  activeMallId: MallId;
  onSelect: (mallId: MallId) => void;
};

export function MallSelectorBar({ activeMallId, onSelect }: MallSelectorBarProps) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2 bg-gray-100">
      {MALLS.map((mall) => {
        const active = mall.id === activeMallId;
        return (
          <Pressable
            key={mall.id}
            onPress={() => onSelect(mall.id)}
            hitSlop={6}
            className={cn(
              'flex-row items-center gap-2 px-3 py-2 rounded-xl bg-white',
              active && 'border border-black',
            )}
          >
            {/* 로고 placeholder (배경칩) — 실제 PNG 들어오면 <Image /> 로 교체 */}
            <View
              className={cn(
                'w-6 h-6 rounded-md items-center justify-center',
                mall.id === 'musinsa' && 'bg-black',
                mall.id === '29cm' && 'bg-neutral-800',
                mall.id === 'zigzag' && 'bg-pink-500',
              )}
            >
              <Text className="text-white text-[10px] font-sans-bold">{mall.shortLabel}</Text>
            </View>
            <Text className="text-xs font-sans-medium">{mall.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
