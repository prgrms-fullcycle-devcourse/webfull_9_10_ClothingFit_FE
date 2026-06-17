import { useState } from 'react';
import { Alert } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { useUploadAvatarImage } from '@/features/characters/api';

// react-native-image-crop-picker(uCrop) 옵션 — 자유 비율 크롭.
// 안드로이드 표준 크롭 UI(uCrop)는 자체 툴바·여백이 있어 어떤 비율 사진이든 모서리 핸들이
// 시스템바에 가리지 않고, freeStyleCropEnabled로 자유 비율 크롭이 된다.
// 적당히 압축해 업로드(백엔드 최대 5MB) 한도 안에 들도록 한다.
const CROP_OPTIONS = {
  cropping: true,
  freeStyleCropEnabled: true,
  mediaType: 'photo' as const,
  compressImageQuality: 0.6,
  cropperToolbarTitle: '영역 선택',
};

/** 라이브러리가 취소 시 던지는 에러 코드 */
function isCancelled(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === 'E_PICKER_CANCELLED';
}

/**
 * 앨범/카메라로 사진을 골라 자유 크롭(uCrop) 후 백엔드(PATCH /avatar/image)로 업로드하는 훅.
 * 업로드 중/후 미리보기용 uri(localUri)와 진행상태를 노출한다.
 */
export function useAvatarImage(onUploaded?: (imageUrl: string) => void) {
  const upload = useUploadAvatarImage();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const uploadImage = async (path: string, mime?: string) => {
    setLocalUri(path); // 업로드 중에도 즉시 미리보기
    // RN 멀티파트 업로드는 { uri, name, type } 형태의 파일 객체 사용 (타입은 Blob로 선언돼 있어 캐스팅)
    const file = { uri: path, name: 'avatar.jpg', type: mime ?? 'image/jpeg' };
    try {
      const res = await upload.mutateAsync({ data: { image: file as unknown as Blob } });
      // 응답: { data: { imageUrl } } (배포 환경에 따라 최상위일 수 있어 방어적으로 처리)
      const imageUrl =
        (res as { data?: { imageUrl?: string }; imageUrl?: string } | undefined)?.data?.imageUrl ??
        (res as { imageUrl?: string } | undefined)?.imageUrl ??
        path;
      setLocalUri(imageUrl);
      onUploaded?.(imageUrl);
    } catch (e) {
      const err = e as {
        code?: string;
        message?: string;
        config?: { url?: string };
        response?: { status?: number; data?: { message?: string } };
      };
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      console.error('[avatar-upload] 실패', {
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
