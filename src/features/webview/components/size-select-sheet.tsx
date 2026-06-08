import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useBodyMeasurements } from '@/features/fitting/hooks/use-body-measurements';
import { checkFit } from '@/features/fitting/utils/fit-check';
import { cn } from '@/utils/cn';

import type { CategoryId } from '../constants/categories';
import type { SizeOption, SizeTableSource } from '../types/copy-session';
import { resolveMeasurementsForDisplay } from '../utils/resolve-slot-measurements';
import { BottomSheet } from './bottom-sheet';

type SizeSelectSheetProps = {
  visible: boolean;
  productTitle?: string;
  /** 기준표 폴백 lookup에 사용할 카테고리 */
  category?: CategoryId;
  options: SizeOption[];
  /** 선택 시 보여줄 사이즈별 측정값 (없으면 기준표 seed로 폴백) */
  sizeTable?: Record<string, Record<string, number>>;
  /** sizeTable 출처 (image/actual/reference 표기용) */
  sizeTableSource?: SizeTableSource;
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
  category,
  options,
  sizeTable,
  sizeTableSource,
  selected,
  onClose,
  onSubmit,
}: SizeSelectSheetProps) {
  const [picked, setPicked] = useState<string | undefined>(selected);
  const body = useBodyMeasurements();

  // 시트가 열릴 때마다 현재 선택값으로 초기화
  const current = picked ?? selected;

  // 1) 실측/OCR 표 → 2) 핵심 측정항목 누락 시 기준표 보완 → 3) 사이즈 없으면 기준표 폴백
  const resolved =
    current && category
      ? resolveMeasurementsForDisplay(category, current, sizeTable, sizeTableSource)
      : {};
  const detail = resolved.measurements;
  const isReference = !!resolved.usedReference;

  // 선택 사이즈 ↔ 체형 핏 비교 (체형은 현재 mock — body_info API 연동 전)
  const fit =
    current && category
      ? checkFit({
          category,
          selectedSize: current,
          sizeTable,
          sizeTableSource,
          sizeOptions: options,
          body,
        })
      : null;

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
        <View className="flex-row items-center mb-1">
          <Text variant="caption" className="font-sans-medium">
            제품 상세 사이즈
          </Text>
          {isReference ? (
            <Text variant="caption" className="ml-2 text-muted">
              · 기준표 추정
            </Text>
          ) : null}
        </View>
        <Text variant="caption" className="text-muted">
          {detail ? formatRow(detail) : '사이즈를 선택하면 상세 치수가 표시돼요'}
        </Text>
      </View>

      {/* 핏 판정 (체형 vs 사이즈) */}
      {fit && !fit.insufficientData ? (
        <View
          className={cn(
            'mt-3 rounded-xl px-4 py-3',
            fit.verdict === 'small'
              ? 'bg-red-50'
              : fit.verdict === 'loose'
                ? 'bg-amber-50'
                : 'bg-green-50',
          )}
        >
          <Text
            className={cn(
              'font-sans-bold text-sm',
              fit.verdict === 'small'
                ? 'text-red-600'
                : fit.verdict === 'loose'
                  ? 'text-amber-700'
                  : 'text-green-700',
            )}
          >
            {fit.verdict === 'small'
              ? '이 사이즈는 작아서 못 입어요'
              : fit.verdict === 'loose'
                ? '넉넉한 핏이에요'
                : '잘 맞아요'}
          </Text>
          {fit.verdict === 'small' && fit.failedParts.length > 0 ? (
            <Text variant="caption" className="mt-0.5 text-red-500">
              {fit.failedParts.join('·')}이(가) 작아요
            </Text>
          ) : null}
          {fit.verdict === 'small' && fit.recommendedSizes.length > 0 ? (
            <Text variant="caption" className="mt-0.5 text-red-500">
              입을 수 있는 사이즈: {fit.recommendedSizes.join(', ')}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Button
        label="등록"
        className="mt-6"
        disabled={!current}
        onPress={() => current && onSubmit(current)}
      />
    </BottomSheet>
  );
}
