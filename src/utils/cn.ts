import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// NotoSansKR은 굵기별로 별도 패밀리(font-sans-thin/medium/bold)로 등록돼 있다.
// 기본 tailwind-merge는 이 커스텀 클래스들을 font-family 그룹으로 인식하지 못해
// variant의 font-sans-medium과 className의 font-sans-bold가 둘 다 남아 충돌한다.
// 같은 font-family 그룹으로 알려줘 뒤(className) 값이 앞(variant)을 덮어쓰게 한다.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-family': [{ font: ['sans-thin', 'sans-medium', 'sans-bold'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
