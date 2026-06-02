import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * 네이티브 소셜 로그인 모듈(카카오·구글) 사용 가능 여부.
 * 웹과 Expo Go(StoreClient)에는 해당 네이티브 모듈이 없어 false.
 * → 개발 빌드/스탠드얼론에서만 true.
 */
export const isNativeSocialAvailable =
  Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
