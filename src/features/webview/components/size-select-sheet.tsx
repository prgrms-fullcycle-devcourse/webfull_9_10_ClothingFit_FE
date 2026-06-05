import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

import type { SizeOption } from '../types/copy-session';
import { BottomSheet } from './bottom-sheet';

type SizeSelectSheetProps = {
  visible: boolean;
  productTitle?: string;
  options: SizeOption[];
  /** 선택 시 보여줄 사이즈별 측정값 (없으면 상세 미표시) */
  sizeTable?: Record<string, Record<string, number>>;
  /** 현재 선택된 사이즈 */
  selected?: string;
  onClose: () => void;
  onSubmit: (sizeLabel: string) => void;
};

/** 측정값 객체 → "어깨 31.6cm 허리 65cm" 형태 */
function formatRow(row: Record<string, number>): string {
  return Object.entries(row)
    .map(([k, v]) => `${k}: ${v}cm`)
    .join('  ');
}

/**
 * 하단 시트: 사이즈(S/M/L…) 칩 선택 + 선택 사이즈의 제품 상세 치수 표시 + 등록.
 */
export function SizeSelectSheet({
  visible,
  productTitle,
  options,
  sizeTable,
  selected,
  onClose,
  onSubmit,
}: SizeSelectSheetProps) {
  const [picked, setPicked] = useState<string | undefined>(selected);

  // 시트가 열릴 때마다 현재 선택값으로 초기화
  const current = picked ?? selected;
  const detail = current && sizeTable ? sizeTable[current] : undefined;

  return (
    <BottomSheet visible={visible} title="사이즈 선택" onClose={onClose}>
      {productTitle ? (
        <Text variant="caption" numberOfLines={1} className="mb-3 text-muted">
          {productTitle}
        </Text>
      ) : null}

      {/* 사이즈 칩 */}
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isSel = current === opt.label;
          return (
            <Pressable
              key={opt.label}
              disabled={opt.soldOut}
              onPress={() => setPicked(opt.label)}
              className={cn(
                'px-4 py-2.5 rounded-xl border min-w-[56px] items-center',
                isSel ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300',
                opt.soldOut && 'opacity-40',
              )}
            >
              <Text
                className={cn(
                  'font-sans-medium',
                  isSel ? 'text-white' : 'text-gray-800',
                  opt.soldOut && 'line-through',
                )}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 제품 상세 사이즈 */}
      <View className="mt-5 rounded-xl bg-surface px-4 py-3">
        <Text variant="caption" className="font-sans-medium mb-1">
          제품 상세 사이즈
        </Text>
        <Text variant="caption" className="text-muted">
          {detail ? formatRow(detail) : '사이즈를 선택하면 상세 치수가 표시돼요'}
        </Text>
      </View>

      <Button
        label="등록"
        className="mt-6"
        disabled={!current}
        onPress={() => current && onSubmit(current)}
      />
    </BottomSheet>
  );
}
