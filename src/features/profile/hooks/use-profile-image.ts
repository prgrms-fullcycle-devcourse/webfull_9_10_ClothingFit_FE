import { usePatchProfileImage } from '@/api/generated/endpoints/profile/profile';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.6,
};

export function useProfileImage(onUploaded?: () => void) {
  const upload = usePatchProfileImage();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setLocalUri(asset.uri); // 업로드 중에도 즉시 미리보기
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? 'profile.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    };
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
