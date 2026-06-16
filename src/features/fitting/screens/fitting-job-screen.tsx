import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useFittingJob } from '@/features/fitting/store/fitting-job-store';
import { cn } from '@/utils/cn';

// 단계 체크리스트는 현재 "연출용"(시간 기반)이라 실제 백엔드 진행도와 무관하다.
// 전체 로딩 시간은 job.status='pending' 동안 유지되어 실제 생성 시간에 자동으로 맞춰진다.
// TODO(백엔드 연동): 생성 API가 단계별 진행 신호를 주면
//   tick 기반 대신 실제 진행도로 체크리스트를 동기화할 것. (B안)
const STEPS = ['의류 합성', '2D 모델 생성'];

/** 회전하는 그라데이션 링 + 중앙 아이콘 */
function SpinningRing() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: 128, height: 128, alignItems: 'center', justifyContent: 'center' }}>
      {/* 회전 그라데이션 원 */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 128,
          height: 128,
          borderRadius: 64,
          transform: [{ rotate }],
        }}
      >
        <LinearGradient
          colors={['#2563eb', '#22d3ee', '#a78bfa', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 128, height: 128, borderRadius: 64 }}
        />
      </Animated.View>
      {/* 도넛 구멍 (링 두께 남김) */}
      <View
        style={{
          position: 'absolute',
          width: 108,
          height: 108,
          borderRadius: 54,
          backgroundColor: '#fff',
        }}
      />
      {/* 중앙 아이콘 (회전 안 함) */}
      <Ionicons name="sparkles" size={38} color="#2563eb" />
    </View>
  );
}

/** 완료 상태: 정적 성공 원 */
function SuccessRing() {
  return (
    <View style={{ width: 128, height: 128, alignItems: 'center', justifyContent: 'center' }}>
      <View
        className="items-center justify-center rounded-full bg-accent"
        style={{ width: 96, height: 96 }}
      >
        <Ionicons name="checkmark" size={46} color="#fff" />
      </View>
    </View>
  );
}

/** 단계 체크리스트 한 줄 */
function StepItem({ label, state }: { label: string; state: 'done' | 'current' | 'pending' }) {
  return (
    <View className="flex-row items-center gap-2.5">
      {state === 'done' ? (
        <Ionicons name="checkmark-circle" size={22} color="#2563eb" />
      ) : state === 'current' ? (
        <View className="h-[22px] w-[22px] items-center justify-center">
          <View className="h-3 w-3 rounded-full bg-accent" />
        </View>
      ) : (
        <Ionicons name="ellipse-outline" size={22} color="#d1d5db" />
      )}
      <Text
        className={cn(
          'font-sans-medium',
          state === 'pending'
            ? 'text-gray-400'
            : state === 'current'
              ? 'text-accent'
              : 'text-gray-700',
        )}
      >
        {label}
        {state === 'current' ? '…' : ''}
      </Text>
    </View>
  );
}

export function FittingJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const job = useFittingJob(jobId);
  const [tick, setTick] = useState(0);

  const status = job?.status;
  useEffect(() => {
    if (status !== 'pending') return;
    const t = setInterval(() => setTick((x) => x + 1), 900);
    return () => clearInterval(t);
  }, [status]);

  if (!job) {
    return (
      <ScreenShell title="피팅 진행">
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text variant="caption">작업을 찾을 수 없어요.</Text>
          <Button label="홈으로" onPress={() => router.replace('/(tabs)/home')} />
        </View>
      </ScreenShell>
    );
  }

  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';

  if (isFailed) {
    return (
      <ScreenShell title="피팅 진행">
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <View
            className="items-center justify-center rounded-full bg-red-50"
            style={{ width: 96, height: 96 }}
          >
            <Ionicons name="alert" size={44} color="#dc2626" />
          </View>
          <Text variant="title">생성에 실패했어요</Text>
          <Text variant="caption" className="text-center text-muted">
            {job.error ?? '잠시 후 다시 시도해 주세요'}
          </Text>
          <Button label="돌아가기" onPress={() => router.back()} className="mt-2" />
        </View>
      </ScreenShell>
    );
  }

  const stepIdx = isDone ? STEPS.length : Math.min(tick, STEPS.length - 1);

  return (
    <ScreenShell title="피팅 진행">
      <View className="flex-1 items-center justify-center gap-8 px-8">
        {isDone ? <SuccessRing /> : <SpinningRing />}

        <Text variant="title" className="text-center">
          {isDone ? '아바타가 완성됐어요!' : '2D 아바타를 만들고 있어요'}
        </Text>

        {/* 단계 체크리스트 */}
        <View className="gap-3.5 self-center">
          {STEPS.map((s, i) => (
            <StepItem
              key={s}
              label={s}
              state={i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'pending'}
            />
          ))}
        </View>

        <Text variant="caption" className="text-center text-muted">
          {isDone
            ? '결과를 확인해 보세요'
            : '다른 화면으로 이동해도 돼요.\n완료되면 알림으로 알려드릴게요.'}
        </Text>

        {isDone && (
          <Button
            label="결과 보기"
            onPress={() =>
              router.replace({ pathname: '/(tabs)/fitting/result', params: { jobId: job.id } })
            }
          />
        )}
      </View>
    </ScreenShell>
  );
}
