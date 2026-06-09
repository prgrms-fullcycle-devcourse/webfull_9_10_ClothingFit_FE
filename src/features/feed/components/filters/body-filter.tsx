import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { RangeSlider } from './range-slider';

const WEIGHT_MIN = 0;
const WEIGHT_MAX = 500;

type BodyValue = {
  height?: number | null;
  weightMin?: number | null;
  weightMax?: number | null;
};

type BodyFilterProps = {
  value: BodyValue;
  onApply: (v: BodyValue) => void;
};

export function BodyFilter({ value, onApply }: BodyFilterProps) {
  const [height, setHeight] = useState(value.height?.toString() ?? '');
  const [weightMin, setWeightMin] = useState(value.weightMin ?? 25);
  const [weightMax, setWeightMax] = useState(value.weightMax ?? 75);
  const [weightMinText, setWeightMinText] = useState(String(value.weightMin ?? 25));
  const [weightMaxText, setWeightMaxText] = useState(String(value.weightMax ?? 75));

  const isWeightInvalid =
    weightMin < WEIGHT_MIN || weightMax > WEIGHT_MAX || weightMin >= weightMax;

  const parsedHeight = height ? Number(height) : null;
  const isHeightInvalid =
    parsedHeight !== null && (isNaN(parsedHeight) || parsedHeight < 0 || parsedHeight > 300);

  const handleApply = () => {
    if (isWeightInvalid || isHeightInvalid) return;
    onApply({ height: parsedHeight, weightMin, weightMax });
  };

  return (
    <View className="px-4 py-4 gap-6">
      {/* 키 */}
      <View className="gap-2">
        <Text className="font-sans-medium text-base">키</Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="키를 입력하세요"
              placeholderTextColor="#aaa"
              style={{ fontSize: 16 }}
            />
          </View>
          <Text className="text-gray-500">cm</Text>
        </View>
        {isHeightInvalid && (
          <Text style={{ color: '#dc2626', fontSize: 12 }}>0~300 사이의 값을 입력해주세요</Text>
        )}
      </View>

      {/* 몸무게 */}
      <View className="gap-3">
        <Text className="font-sans-medium text-base">몸무게</Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={weightMinText}
              onChangeText={(t) => {
                setWeightMinText(t);
                const v = parseInt(t, 10);
                if (!isNaN(v)) setWeightMin(Math.min(v, weightMax - 1));
              }}
              keyboardType="numeric"
              style={{ fontSize: 16 }}
            />
          </View>
          <Text className="text-gray-400">~</Text>
          <View className="flex-1 border border-gray-200 rounded-xl px-4 py-3">
            <TextInput
              value={weightMaxText}
              onChangeText={(t) => {
                setWeightMaxText(t);
                const v = parseInt(t, 10);
                if (!isNaN(v)) setWeightMax(Math.max(v, weightMin + 1));
              }}
              keyboardType="numeric"
              style={{ fontSize: 16 }}
            />
          </View>
          <Text className="text-gray-500">kg</Text>
        </View>

        <RangeSlider
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          minValue={weightMin}
          maxValue={weightMax}
          step={1}
          labels={['0', '250', '500']}
          onChangeMin={(v) => {
            setWeightMin(v);
            setWeightMinText(String(v));
          }}
          onChangeMax={(v) => {
            setWeightMax(v);
            setWeightMaxText(String(v));
          }}
        />
        {isWeightInvalid && (
          <Text style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
            0~500 사이의 값을 입력해주세요
          </Text>
        )}
      </View>

      <Pressable onPress={handleApply} className="bg-black py-4 rounded-2xl items-center">
        <Text className="text-white font-sans-bold text-base">등록</Text>
      </Pressable>
    </View>
  );
}
