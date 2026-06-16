import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui/text';

/**
 * COPY 페이지 첫 진입 시 뜨는 코치마크 — 올원뱅크 스타일.
 * - 화면 전체를 어둡게 + 각 UI에 화살표·설명을 "한 번에" 표시.
 * - 사이드바 드래그처럼 움직이는 기능은 ↕ 화살표(살짝 애니메이션)로 표현.
 * - 하단에 "다시 보지 않기" 체크 + X. X로 닫고, 체크 시 다음부턴 안 뜬다.
 *   (체크 안 하면 앱 켤 때마다 다시 노출)
 * - 빼려면: 이 파일 + explore-browser-screen.tsx의 측정/렌더 코드 제거.
 */
const SEEN_KEY = 'copy_coach_seen_v2';
const ACCENT = '#34d399'; // 안내 화살표/포인트 색 (어두운 배경에서 잘 보이는 민트)

// ▼▼ "COPY 사용법" 라벨 / "다시 보지 않기" / "X" 위치 조정 ▼▼ (px)
const LAYOUT = {
  headerX: 0, // "COPY 사용법" 좌우 (+오른쪽 / -왼쪽)
  headerY: 45, // "COPY 사용법" 위에서부터 거리 (클수록 아래)
  dontShowX: 20, // "다시 보지 않기" 왼쪽 끝에서 거리 (클수록 오른쪽)
  dontShowY: 70, // "다시 보지 않기" 아래 끝에서 거리 (클수록 위)
  closeX: 20, // "X" 오른쪽 끝에서 거리 (클수록 왼쪽)
  closeY: 65, // "X" 아래 끝에서 거리 (클수록 위)
};
// ▲▲ 여기 숫자만 바꾸면 됨 ▲▲

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type CoachRect = { x: number; y: number; width: number; height: number };
export type CoachArrow = 'up' | 'down' | 'right' | 'updown';
export type CoachStep = {
  rect: CoachRect | null;
  title: string;
  desc: string;
  arrow?: CoachArrow;
  // 미세 위치 보정 (px). +ax=오른쪽, +ay=아래쪽. 화살표(a*)/텍스트(t*) 따로.
  ax?: number;
  ay?: number;
  tx?: number;
  ty?: number;
};

const ICON = 28;

/** 움직임 강조용 화살표 (위아래로 살짝 흔들림) */
function BounceArrow({ name }: { name: IconName }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <Ionicons name={name} size={ICON} color={ACCENT} />
    </Animated.View>
  );
}

function Callout({
  step,
  screenW,
  screenH,
}: {
  step: CoachStep;
  screenW: number;
  screenH: number;
}) {
  const r = step.rect;
  if (!r) return null;
  const arrow: CoachArrow = step.arrow ?? 'up';
  const cx = r.x + r.width / 2; // 타깃 중심 x
  const cy = r.y + r.height / 2; // 타깃 중심 y
  const ax = step.ax ?? 0;
  const ay = step.ay ?? 0;
  const tx = step.tx ?? 0;
  const ty = step.ty ?? 0;

  const TitleDesc = (
    <>
      <Text className="text-white font-sans-bold text-base">{step.title}</Text>
      <Text className="text-white/85 text-xs mt-1 leading-5">{step.desc}</Text>
    </>
  );

  // 화살표(ax/ay)와 글(tx/ty)을 완전히 독립적으로 움직인다.
  // +x=오른쪽, -x=왼쪽 / +y=아래, -y=위.

  // 1) 하단 타깃(COPY/Delete): 글이 위, 화살표가 그 아래(버튼을 가리킴). 좌/우 반쪽씩 사용.
  if (arrow === 'down') {
    const leftHalf = cx < screenW / 2;
    const arrowBottom0 = screenH - r.y + 2;
    const textBottom0 = arrowBottom0 + ICON + 4;
    return (
      <>
        <View
          style={{ position: 'absolute', left: cx - ICON / 2 + ax, bottom: arrowBottom0 - ay }}
          pointerEvents="none"
        >
          <Ionicons name="arrow-down" size={ICON} color={ACCENT} />
        </View>
        <View
          style={{
            position: 'absolute',
            left: (leftHalf ? 14 : screenW / 2 + 8) + tx,
            bottom: textBottom0 - ty,
            width: screenW / 2 - 22,
          }}
          pointerEvents="none"
        >
          {TitleDesc}
        </View>
      </>
    );
  }

  // 2) 우측 타깃(사이드바): 토글 위에 ↑, 아래에 ↓ 두 개로 "위아래 이동"을 표현. 글은 왼쪽.
  if (arrow === 'updown' || arrow === 'right') {
    return (
      <>
        <View
          style={{ position: 'absolute', left: cx - ICON / 2 + ax, top: r.y - ICON - 2 + ay }}
          pointerEvents="none"
        >
          <BounceArrow name="arrow-up" />
        </View>
        <View
          style={{ position: 'absolute', left: cx - ICON / 2 + ax, top: r.y + r.height + 2 + ay }}
          pointerEvents="none"
        >
          <BounceArrow name="arrow-down" />
        </View>
        <View
          style={{
            position: 'absolute',
            right: screenW - r.x + 8 - tx,
            top: Math.max(44, cy - 36) + ty,
            maxWidth: 220,
          }}
          className="items-end"
          pointerEvents="none"
        >
          {TitleDesc}
        </View>
      </>
    );
  }

  // 3) 상단 타깃(쇼핑몰): 드롭다운 아래에 ↑, 글은 그 아래.
  return (
    <>
      <View
        style={{ position: 'absolute', left: cx - ICON / 2 + ax, top: r.y + r.height + 6 + ay }}
        pointerEvents="none"
      >
        <Ionicons name="arrow-up" size={ICON} color={ACCENT} />
      </View>
      <View
        style={{
          position: 'absolute',
          left: Math.max(14, Math.min(cx - 105, screenW - 224)) + tx,
          top: r.y + r.height + ICON + 18 + ty,
          maxWidth: 230,
        }}
        pointerEvents="none"
      >
        {TitleDesc}
      </View>
    </>
  );
}

export function CopyCoachmark({ steps, ready }: { steps: CoachStep[]; ready: boolean }) {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const { width: screenW, height: screenH } = useWindowDimensions();

  useEffect(() => {
    if (!ready) return;
    SecureStore.getItemAsync(SEEN_KEY)
      .then((v) => {
        if (!v) setVisible(true);
      })
      .catch(() => {});
  }, [ready]);

  // X로 닫기. "다시 보지 않기"를 체크했을 때만 기억해서 다음부턴 안 뜨게 한다.
  const close = () => {
    setVisible(false);
    if (dontShow) SecureStore.setItemAsync(SEEN_KEY, '1').catch(() => {});
  };

  if (!visible || steps.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)' }}>
        {/* "COPY 사용법" 라벨 (상단 중앙, LAYOUT으로 위치 조정) */}
        <View
          style={{ position: 'absolute', top: LAYOUT.headerY, left: 0, right: 0 }}
          className="items-center"
          pointerEvents="none"
        >
          <Text
            className="text-white/70 text-xs"
            style={{ transform: [{ translateX: LAYOUT.headerX }] }}
          >
            COPY 사용법
          </Text>
        </View>

        {/* 모든 콜아웃을 한 번에 */}
        {steps.map((s) => (
          <Callout key={s.title} step={s} screenW={screenW} screenH={screenH} />
        ))}

        {/* "다시 보지 않기" (왼쪽 아래, LAYOUT으로 위치 조정) */}
        <Pressable
          onPress={() => setDontShow((p) => !p)}
          hitSlop={8}
          style={{ position: 'absolute', left: LAYOUT.dontShowX, bottom: LAYOUT.dontShowY }}
          className="flex-row items-center gap-2"
        >
          <View
            className={`w-5 h-5 rounded items-center justify-center border ${
              dontShow ? 'bg-white border-white' : 'border-white/70'
            }`}
          >
            {dontShow && <Ionicons name="checkmark" size={14} color="#111827" />}
          </View>
          <Text className="text-white text-sm">다시 보지 않기</Text>
        </Pressable>

        {/* "X" 닫기 (오른쪽 아래, LAYOUT으로 위치 조정) */}
        <Pressable
          onPress={close}
          hitSlop={10}
          style={{ position: 'absolute', right: LAYOUT.closeX, bottom: LAYOUT.closeY }}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}
