import { useState } from 'react';
import { Alert } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { usePatchProfileImage } from '@/api/generated/endpoints/profile/profile';

// 크롭 UI(uCrop)는 아바타와 통일. 1:1을 기본으로 시작하되 freeStyleCropEnabled로 크롭 박스를
// 드래그해 줄이고/키울 수 있게 한다. 적당히 압축해 업로드(백엔드 최대 5MB) 한도 안에 들도록 한다.
const CROP_OPTIONS = {
  cropping: true,
  width: 1000,
  height: 1000,
  freeStyleCropEnabled: true,
  mediaType: 'photo' as const,
  compressImageQuality: 0.6,
  cropperToolbarTitle: '프로필 사진',
};

/** 라이브러리가 취소 시 던지는 에러 코드 */
function isCancelled(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === 'E_PICKER_CANCELLED';
}

export function useProfileImage(onUploaded?: () => void) {
  const upload = usePatchProfileImage();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const uploadImage = async (path: string, mime?: string) => {
    setLocalUri(path); // 업로드 중에도 즉시 미리보기
    const file = { uri: path, name: 'profile.jpg', type: mime ?? 'image/jpeg' };
    try {
      await upload.mutateAsync({ data: { image: file as unknown as Blob } });
      onUploaded?.();
    } catch (e) {
      const err = e as {
        code?: string;
        message?: string;
        config?: { url?: string };
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      console.error('[profile-image-upload] 실패', {
        status,
        code: err?.code,
        url: err?.config?.url,
        data: err?.response?.data,
        message: err?.message,
      });
      const hint =
        serverMsg ?? err?.message ?? '사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.';
      Alert.alert('업로드 실패', `[${status ?? err?.code ?? 'ERR'}] ${hint}`);
      setLocalUri(null);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const image = await ImageCropPicker.openPicker(CROP_OPTIONS);
      await uploadImage(image.path, image.mime);
    } catch (e) {
      if (!isCancelled(e)) Alert.alert('사진 선택 실패', '잠시 후 다시 시도해 주세요.');
    }
  };

  const takePhoto = async () => {
    try {
      const image = await ImageCropPicker.openCamera(CROP_OPTIONS);
      await uploadImage(image.path, image.mime);
    } catch (e) {
      if (!isCancelled(e)) Alert.alert('사진 촬영 실패', '잠시 후 다시 시도해 주세요.');
    }
  };

  return {
    pickFromLibrary,
    takePhoto,
    localUri,
    isUploading: upload.isPending,
    reset: () => setLocalUri(null),
  };
}
