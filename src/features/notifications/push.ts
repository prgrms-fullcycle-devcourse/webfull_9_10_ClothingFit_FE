import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Expo 푸시 토큰 발급 (순수 함수 — React 훅 아님).
 *
 * 권한 요청 → (안드로이드) 알림 채널 생성 → Expo push token 발급까지 담당한다.
 * 서버 등록은 호출하는 훅(use-push-notifications) 쪽에서 처리한다.
 *
 * 실기기에서만 동작한다.
 *
 * @returns 발급된 Expo push token 문자열. 권한 거부/비실기기 등인 경우 null.
 */
export async function getExpoPushToken(): Promise<string | null> {
  // 1) 실기기 체크 — 에뮬레이터/시뮬레이터에선 원격 푸시 토큰을 못 받는다.
  if (!Device.isDevice) {
    console.log('[Push] 실기기가 아니라 푸시 토큰 발급을 건너뜀');
    return null;
  }

  // 2) (안드로이드) 알림 채널 먼저 생성 — 이게 없으면 권한 프롬프트도 안 뜨고 토큰도 못 받는다.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '기본 알림',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 3) 권한 확인 후, 아직 허용 안 됐으면 요청
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('[Push] 알림 권한이 거부됨');
    return null;
  }

  // 4) Expo push token 발급
  //    projectId를 명시하면 계정 이전/이름 변경 시에도 토큰이 안정적으로 유지된다.
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    console.warn('[Push] projectId를 찾지 못함 (app.json의 extra.eas.projectId 확인 필요)');
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Push] Expo push token 발급:', tokenData.data);
    return tokenData.data;
  } catch (e) {
    console.log('[Push] 토큰 발급 실패:', e);
    return null;
  }
}
