import { Pressable, View } from 'react-native';

import { GetPostsGender } from '@/api/generated/schemas';
import { Text } from '@/components/ui/text';

type GenderFilterProps = {
  value: GetPostsGender | undefined;
  onChange: (v: GetPostsGender | undefined) => void;
};

const OPTIONS = [
  { label: '전체', value: undefined },
  { label: '여성', value: GetPostsGender.FEMALE },
  { label: '남성', value: GetPostsGender.MALE },
] as const;

export function GenderFilter({ value, onChange }: GenderFilterProps) {
  return (
    <View className="px-4 py-4 gap-3">
      <Text className="font-sans-medium text-base">성별</Text>
      <View className="flex-row gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(opt.value)}
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
