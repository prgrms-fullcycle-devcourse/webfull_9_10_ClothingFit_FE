/**
 * characters feature API 파사드.
 * Orval 생성물을 도메인 이름으로 re-export 한다 — 화면은 생성 경로 대신 여기서 import.
 */
export { useGetCharacters as useCharacters } from '@/api/generated/endpoints/characters/characters';
// 캐릭터 선택은 배포 서버에 POST /characters/me가 없어 PATCH /avatar(아바타 캐릭터 변경) 사용
export {
  getGetAvatarQueryKey,
  useGetAvatar as useAvatar, // GET /avatar (현재 아바타/프로필 이미지)
  usePatchAvatar as useSelectCharacter,
  usePatchAvatarImage as useUploadAvatarImage, // PATCH /avatar/image (사진 업로드)
} from '@/api/generated/endpoints/avatar/avatar';
export type { CharacterListItem as Character, GroupedCharacters } from '@/api/generated/schemas';
