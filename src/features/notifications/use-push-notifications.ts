import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { getAuthVersion, subscribeAuthChange } from '@/lib/api-client';

import { usePostNotificationsDeviceTokens } from '@/api/generated/endpoints/notification/notification';
import { router } from 'expo-router';
import { getExpoPushToken } from './push';

/**
 * 앱이 포그라운드(화면이 켜진 상태)일 때도 알림 배너를 표시하도록 설정.
 * 모듈 최상위에서 한 번만 설정하면 된다.
 *
 * 참고: SDK 53+ 에서 shouldShowAlert 가 shouldShowBanner/shouldShowList 로 분리됐다.
 * 설치된 expo-notifications 타입에서 빨간 줄이 뜨면 해당 버전 필드명에 맞춰 조정할 것.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * 푸시 알림 등록 + 수신 처리 훅.
 *
 * 하는 일:
 * 1) Expo push token 발급(getExpoPushToken) 후 백엔드에 등록(POST /notifications/device-tokens)
 * 2) 알림을 탭했을 때의 동작(예: 알림 화면으로 이동) 리스너 등록
 *
 * 항상 떠 있는 곳(루트/탭 레이아웃)에서 한 번 호출한다.
 * 로그인 상태가 바뀌면(authVersion) 토큰을 다시 등록한다.
 */
export function usePushNotifications() {
  const { mutate: registerToken } = usePostNotificationsDeviceTokens();
  // 로그인/로그아웃 시 토큰 주인이 바뀌므로 재등록 트리거로 사용
  const authVersion = useSyncExternalStore(subscribeAuthChange, getAuthVersion);

  // mutate 함수가 매 렌더마다 새로 생겨 effect가 과하게 도는 것을 막기 위해 ref에 보관
  const registerRef = useRef(registerToken);
  registerRef.current = registerToken;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getExpoPushToken();
      if (cancelled || !token) return;
      // 백엔드는 { token } 만 받는다 (platform 불필요 — Expo token이 플랫폼 통합 토큰)
      registerRef.current({ data: { token } });
    })();

    return () => {
      cancelled = true;
    };
  }, [authVersion]);

  useEffect(() => {
    // 탭 시 이동 처리 — 포그라운드/백그라운드/종료 상태 공통으로 사용
    const handleTap = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const data = response.notification.request.content.data;
      console.log('[Push] 알림 탭 처리, data:', data);
      // 일단 단순하게: 알림 목록 화면으로
      router.push('/(tabs)/profile/notifications');
    };

    // ① 앱이 완전히 종료된 상태에서 알림 탭으로 켜진 경우 — 시작 시 한 번 확인
    //    라우터가 준비되기 전일 수 있어 살짝 지연을 줌
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      setTimeout(() => handleTap(response), 300);
    });

    // ② 앱이 살아있을 때(포그라운드/백그라운드) 알림 탭한 경우 — 리스너
    const responseSub = Notifications.addNotificationResponseReceivedListener(handleTap);

    // (선택) 포그라운드에서 알림을 받은 순간의 처리 — 필요 없으면 지워도 됨
    const receiveSub = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Push] 포그라운드 수신:', notification.request.content.title);
    });

    return () => {
      responseSub.remove();
      receiveSub.remove();
    };
  }, []);
}
