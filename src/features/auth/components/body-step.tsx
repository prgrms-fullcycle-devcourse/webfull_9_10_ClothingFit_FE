import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  findNodeHandle,
  Keyboard,
  ScrollView,
  View,
  type TextInput as RNTextInput,
} from 'react-native';

import { LabeledInput } from '@/components/ui/labeled-input';
import { Text } from '@/components/ui/text';
import { GIRTH_FIELDS, ROW_FIELDS, type FieldKey } from '@/features/auth/constants/body-fields';

// 포커스된 입력을 키보드 위로 얼마나 띄울지(여백)
const FOCUS_OFFSET = 200;

type BodyStepProps = {
  form: Record<FieldKey, string>;
  changeInput: (key: FieldKey, value: string) => void;
  /** BodyStep을 감싼 ScrollView ref — 포커스된 입력이 키보드 위로 보이게 스크롤한다. */
  scrollRef?: RefObject<ScrollView | null>;
};

export function BodyStep({ form, changeInput, scrollRef }: BodyStepProps) {
  // 입력 완료(키보드의 다음 키) 시 다음 입력으로 포커스를 넘기기 위한 ref 체인.
  // 순서: ROW_FIELDS(키·몸무게) → GIRTH_FIELDS(둘레들).
  const total = ROW_FIELDS.length + GIRTH_FIELDS.length;
  const inputs = useRef<(RNTextInput | null)[]>([]);
  const focusedIndex = useRef(-1); // 현재 포커스된 입력 (키보드가 뜬 뒤 재스크롤용)

  // 포커스된 입력이 키보드에 가리지 않도록 부모 ScrollView를 키보드 위로 스크롤.
  // (프로그램상 focus() 이동 시 OS 자동 스크롤이 안 따라오는 경우 대비 — RN 내장 응답자 사용)
  const scrollToInput = (index: number) => {
    const node = inputs.current[index];
    const scroll = scrollRef?.current;
    if (!node || !scroll) return;
    const handle = findNodeHandle(node);
    if (handle == null) return;
    const responder = scroll.getScrollResponder() as
      | {
          scrollResponderScrollNativeHandleToKeyboard?: (
            handle: number,
            offset: number,
            prevent: boolean,
          ) => void;
        }
      | undefined;
    responder?.scrollResponderScrollNativeHandleToKeyboard?.(handle, FOCUS_OFFSET, true);
  };

  // 키보드 높이 — 맨 아래 입력(발 크기 등)도 키보드 위로 올라갈 수 있도록
  // 스크롤 콘텐츠 끝에 키보드 높이+여백만큼 빈 공간을 둔다.
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates.height);
      // 맨 아래 입력을 직접 탭한 경우: 키보드가 뜨며 여백이 생긴 뒤에야 스크롤이 가능하므로
      // 키보드 표시 직후 현재 포커스된 입력으로 다시 스크롤한다.
      setTimeout(() => scrollToInput(focusedIndex.current), 50);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
    // refs/props가 stable하므로 1회만 등록한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // index 입력에 적용할 ref/다음키/포커스 스크롤 동작. 마지막은 'done'으로 키보드를 닫는다.
  const chain = (index: number) => ({
    ref: (el: RNTextInput | null) => {
      inputs.current[index] = el;
    },
    returnKeyType: (index < total - 1 ? 'next' : 'done') as 'next' | 'done',
    blurOnSubmit: index === total - 1,
    onSubmitEditing: () => inputs.current[index + 1]?.focus(),
    onFocus: () => {
      focusedIndex.current = index;
      scrollToInput(index);
    },
  });

  return (
    <View className="gap-4">
      <Text variant="subtitle">몸 치수 등록</Text>

      <View className="flex-row gap-3">
        {ROW_FIELDS.map((f, i) => (
          <LabeledInput
            key={f.key}
            containerClassName="flex-1"
            label={f.label}
            required={f.required}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChangeText={(value) => changeInput(f.key, value)}
            keyboardType="number-pad"
            maxLength={3}
            {...chain(i)}
          />
        ))}
      </View>

      {GIRTH_FIELDS.map((f, i) => (
        <LabeledInput
          key={f.key}
          label={f.label}
          required={f.required}
          placeholder={f.placeholder}
          value={form[f.key]}
          onChangeText={(value) => changeInput(f.key, value)}
          keyboardType="number-pad"
          maxLength={3}
          {...chain(ROW_FIELDS.length + i)}
        />
      ))}

      {/* 키보드가 떠 있을 때, 맨 아래 입력도 키보드 위로 스크롤될 수 있도록 빈 공간 확보 */}
      {kbHeight > 0 && <View style={{ height: kbHeight + FOCUS_OFFSET }} />}
    </View>
  );
}
