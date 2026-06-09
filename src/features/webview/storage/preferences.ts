import * as SecureStore from 'expo-secure-store';

/**
 * 사용자 설정 영속화 (간단한 boolean flag).
 * SecureStore는 작은 값에 최적화. 더 많아지면 AsyncStorage로 이관.
 */

const KEY_DONT_SHOW_NO_SIZE = 'webview.dontShowNoSizeAlert';

export async function getDontShowNoSizeAlert(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(KEY_DONT_SHOW_NO_SIZE);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setDontShowNoSizeAlert(value: boolean) {
  try {
    await SecureStore.setItemAsync(KEY_DONT_SHOW_NO_SIZE, value ? '1' : '0');
  } catch {
    // 무시 — 영속화 실패해도 앱은 동작
  }
}
