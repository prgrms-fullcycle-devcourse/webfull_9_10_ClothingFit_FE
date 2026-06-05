import { Text, View } from 'react-native';

/**
 * 앱 진입 시 잠깐 보여주는 커스텀 스플래시 화면.
 * 검정 배경에 'CLOTHING - FIT' 텍스트만 출력한다.
 * (네이티브 스플래시는 이미지만 표시할 수 있어 텍스트는 RN 화면으로 처리)
 */
export function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#ffffff',
          fontSize: 28,
          letterSpacing: 4,
          fontFamily: 'NotoSansKR_700Bold',
        }}
      >
        CLOTHING - FIT
      </Text>
    </View>
  );
}
