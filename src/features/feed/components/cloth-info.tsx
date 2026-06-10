import { PostClothingItem } from '@/api/generated/schemas';
import { Text } from '@/components/ui/text';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Image, Pressable, View } from 'react-native';

export function ClothInfo({ item }: { item: PostClothingItem }) {
  const handleOpenLink = async () => {
    if (!item.link) return;
    try {
      await WebBrowser.openBrowserAsync(item.link);
    } catch {
      Alert.alert('오류', '상품 페이지를 열 수 없습니다.');
    }
  };

  return (
    <View className="mx-4 mb-2 rounded-xl border border-border flex-row overflow-hidden">
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 96, height: 96, marginRight: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-24 h-24 bg-surface mr-3" />
      )}
      <View className="flex-1 flex-row justify-between items-center px-5">
        <View className="flex-1 flex-col gap-2 mr-2">
          <View className="flex-row items-center gap-2">
            <Text className="font-sans-medium">{item.brand}</Text>
            {item.size && <Text variant="label">사이즈 : {item.size}</Text>}
          </View>
          <Text variant="caption">{item.name}</Text>
        </View>
        <Pressable onPress={handleOpenLink} className="p-2 -mr-2">
          <Ionicons name="open-outline" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
