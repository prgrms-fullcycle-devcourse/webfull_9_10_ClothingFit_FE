import { Pressable, View } from 'react-native';

import { GetPostsSort } from '@/api/generated/schemas';
import { Text } from '@/components/ui/text';

type SortFilterProps = {
  value: GetPostsSort | undefined;
  onChange: (v: GetPostsSort | undefined) => void;
};

const OPTIONS = [
  { label: '최신순', value: GetPostsSort.LATEST },
  { label: '오래된순', value: GetPostsSort.OLDEST },
  { label: '좋아요순', value: GetPostsSort.LIKE },
] as const;

export function SortFilter({ value, onChange }: SortFilterProps) {
  return (
    <View className="px-4 py-4 gap-3">
      <Text className="font-sans-medium text-base">정렬</Text>
      <View className="flex-row gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(selected ? undefined : opt.value)}
              className={`flex-1 py-3 rounded-xl items-center ${selected ? 'bg-black' : 'bg-gray-100'}`}
            >
              <Text className={selected ? 'text-white font-sans-bold' : 'text-gray-600'}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
