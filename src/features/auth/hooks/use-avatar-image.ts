import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useUploadAvatarImage } from '@/features/characters/api';

// 아바타는 정사각으로 크롭 + 적당히 압축해 업로드(백엔드 최대 5MB) 한도 안에 들도록 한다.
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6,
};

/**
 * 앨범/카메라로 사진을 골라 백엔드(PATCH /avatar/image)로 업로드하는 훅.
 * 업로드 중/후 미리보기용 uri(localUri)와 진행상태를 노출한다.
 */
export function useAvatarImage(onUploaded?: (imageUrl: string) => void) {
  const upload = useUploadAvatarImage();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setLocalUri(asset.uri); // 업로드 중에도 즉시 미리보기
    // RN 멀티파트 업로드는 { uri, name, type } 형태의 파일 객체 사용 (타입은 Blob로 선언돼 있어 캐스팅)
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? 'avatar.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    };
    try {
      const res = await upload.mutateAsync({ data: { image: file as unknown as Blob } });
      // 응답: { data: { imageUrl } } (배포 환경에 따라 최상위일 수 있어 방어적으로 처리)
      const imageUrl =
        (res as { data?: { imageUrl?: string }; imageUrl?: string } | undefined)?.data?.imageUrl ??
        (res as { imageUrl?: string } | undefined)?.imageUrl ??
        asset.uri;
      setLocalUri(imageUrl);
      onUploaded?.(imageUrl);
    } catch (e) {
      // 실제 실패 원인(상태코드/서버메시지/네트워크코드)을 드러내 진단을 쉽게 한다.
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
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 사진 보관함 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (result.canceled || !result.assets?.[0]) return;
    await handleAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (result.canceled || !result.assets?.[0]) return;
    await handleAsset(result.assets[0]);
  };

  return {
    pickFromLibrary,
    takePhoto,
    localUri,
    isUploading: upload.isPending,
    reset: () => setLocalUri(null),
  };
}
