import { useEffect, useRef } from 'react';
import { Animated, PanResponder, View } from 'react-native';

import { Text } from '@/components/ui/text';

const HANDLE_SIZE = 24;

type RangeSliderProps = {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  labels?: [string, string, string];
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
};

export function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  labels,
  onChangeMin,
  onChangeMax,
}: RangeSliderProps) {
  const trackWidthAnim = useRef(new Animated.Value(0)).current;
  const trackWidthRef = useRef(0);

  const toRatio = (v: number) => (v - min) / (max - min);
  const toValue = (r: number) =>
    Math.round((min + Math.max(0, Math.min(1, r)) * (max - min)) / step) * step;

  const minRatioAnim = useRef(new Animated.Value(toRatio(minValue))).current;
  const maxRatioAnim = useRef(new Animated.Value(toRatio(maxValue))).current;
  const minRatioRef = useRef(toRatio(minValue));
  const maxRatioRef = useRef(toRatio(maxValue));

  const onChangeMinRef = useRef(onChangeMin);
  const onChangeMaxRef = useRef(onChangeMax);
  useEffect(() => {
    onChangeMinRef.current = onChangeMin;
  }, [onChangeMin]);
  useEffect(() => {
    onChangeMaxRef.current = onChangeMax;
  }, [onChangeMax]);

  useEffect(() => {
    const sync = (v: number, ref: typeof minRatioRef, anim: Animated.Value) => {
      const r = (v - min) / (max - min);
      if (Math.abs(r - ref.current) > 0.001) {
        ref.current = r;
        anim.setValue(r);
      }
    };
    sync(minValue, minRatioRef, minRatioAnim);
    sync(maxValue, maxRatioRef, maxRatioAnim);
  }, [minValue, maxValue, min, max, minRatioAnim, maxRatioAnim]);

  const makePR = (
    ratioRef: React.RefObject<number>,
    ratioAnim: Animated.Value,
    clamp: (r: number) => number,
    onChangeRef: React.RefObject<(v: number) => void>,
  ) => {
    const startRef = { current: 0 };
    const apply = (dx: number) => {
      if (!trackWidthRef.current) return;
      const r = clamp(startRef.current + dx / trackWidthRef.current);
      ratioRef.current = r;
      ratioAnim.setValue(r);
      onChangeRef.current(toValue(r));
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = ratioRef.current;
      },
      onPanResponderMove: (_, g) => apply(g.dx),
      onPanResponderRelease: (_, g) => apply(g.dx),
    });
  };

  const minPR = useRef(
    makePR(
      minRatioRef,
      minRatioAnim,
      (r) => Math.max(0, Math.min(maxRatioRef.current - 0.01, r)),
      onChangeMinRef,
    ),
  ).current;

  const maxPR = useRef(
    makePR(
      maxRatioRef,
      maxRatioAnim,
      (r) => Math.min(1, Math.max(minRatioRef.current + 0.01, r)),
      onChangeMaxRef,
    ),
  ).current;

  const minLeft = useRef(Animated.multiply(minRatioAnim, trackWidthAnim)).current;
  const maxLeft = useRef(Animated.multiply(maxRatioAnim, trackWidthAnim)).current;
  const fillWidth = useRef(
    Animated.multiply(Animated.subtract(maxRatioAnim, minRatioAnim), trackWidthAnim),
  ).current;

  return (
    <View className="gap-1">
      <View
        style={{ height: HANDLE_SIZE }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          trackWidthRef.current = w;
          trackWidthAnim.setValue(w);
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: HANDLE_SIZE / 2 - 1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#e5e7eb',
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: HANDLE_SIZE / 2 - 1,
            left: minLeft,
            width: fillWidth,
            height: 2,
            backgroundColor: '#111',
          }}
        />
        <Animated.View
          {...minPR.panHandlers}
          style={{
            position: 'absolute',
            top: 0,
            left: Animated.subtract(minLeft, HANDLE_SIZE / 2),
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: HANDLE_SIZE / 2,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#111',
          }}
        />
        <Animated.View
          {...maxPR.panHandlers}
          style={{
            position: 'absolute',
            top: 0,
            left: Animated.subtract(maxLeft, HANDLE_SIZE / 2),
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: HANDLE_SIZE / 2,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#111',
          }}
        />
      </View>

      {labels && (
        <View className="flex-row justify-between">
          {labels.map((label, i) => (
            <Text key={i} className="text-xs text-gray-400">
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
