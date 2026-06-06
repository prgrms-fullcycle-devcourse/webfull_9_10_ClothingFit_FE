import { TextInput as RNTextInput, type TextInputProps } from 'react-native';

import { cn } from '@/utils/cn';

export function TextInput({ className, style, ...props }: TextInputProps) {
  return (
    <RNTextInput
      className={cn('font-sans text-primary', className)}
      // NotoSansKR(한글 폰트)는 글리프가 커서, 기본 includeFontPadding(Android)와
      // 세로 정렬 탓에 단일행 입력 안에서 placeholder/텍스트가 잘리거나 세로로 스크롤됨.
      // 폰트 여백 제거 + 세로 가운데 정렬로 보정한다. (style prop이 덮어쓸 수 있게 앞에 둠)
      style={[{ includeFontPadding: false, textAlignVertical: 'center' }, style]}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
