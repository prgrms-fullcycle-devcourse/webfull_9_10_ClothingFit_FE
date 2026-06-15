import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, View } from 'react-native';

import { getGetProfileQueryKey } from '@/api/generated/endpoints/profile/profile';
import { ScreenShell } from '@/components/blocks/screen-shell';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { showBanner } from '@/features/notifications/banner-store';
import { useProfile } from '../api';
import { useProfileImage } from '../hooks/use-profile-image';

/** 프로필(아바타) 이미지 변경 화면. 현재 이미지를 보여주고 앨범/카메라로 새 사진을 업로드한다. */
export function ProfileImageScreen() {
  const qc = useQueryClient();
  const profile = useProfile();
  // 업로드(PATCH /avatar/image)는 useAvatarImage가 처리. 성공 시 아바타·프로필 캐시를 갱신해 즉시 반영.
  const { pickFromLibrary, takePhoto, localUri, isUploading, reset } = useProfileImage(() => {
    qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    reset();
    showBanner({ title: '프로필 이미지 변경 완료', message: '새 이미지가 적용되었어요.' });
  });

  const currentImage = localUri ?? profile.data?.imageUrl;

  return (
    <ScreenShell title="프로필 이미지 변경" edges={['top', 'bottom']}>
      <View className="flex-1 items-center px-6 pt-8">
        <View className="h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-surface">
          {isUploading ? (
            <ActivityIndicator />
          ) : currentImage ? (
            <Image source={currentImage} contentFit="cover" className="h-full w-full" />
          ) : (
            <Ionicons name="person" size={64} color="#9ca3af" />
          )}
        </View>

        <View className="mt-8 w-full gap-3">
          <Button label="앨범에서 선택" onPress={pickFromLibrary} disabled={isUploading} />
          <Button label="사진 촬영" variant="ghost" onPress={takePhoto} disabled={isUploading} />
        </View>

        <Text variant="caption" className="mt-6 text-center">
          업로드한 사진이 프로필·아바타 이미지로 사용됩니다.
        </Text>
      </View>
    </ScreenShell>
  );
}
