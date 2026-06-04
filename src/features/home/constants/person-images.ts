// 홈 화면 카드에서 공통으로 쓰는 인물 이미지 6종 — index 순서대로 순환
export const PERSON_IMAGES = [
  require('../../../../assets/images/male-average.png'),
  require('../../../../assets/images/famale-average.png'),
  require('../../../../assets/images/male-slim.png'),
  require('../../../../assets/images/famale-slim.png'),
  require('../../../../assets/images/male-fat.png'),
  require('../../../../assets/images/famale-fat.png'),
];

export function personImageAt(index: number) {
  return PERSON_IMAGES[index % PERSON_IMAGES.length];
}
