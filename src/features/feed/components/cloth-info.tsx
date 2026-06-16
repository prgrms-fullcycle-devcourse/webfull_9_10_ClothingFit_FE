import { useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';

import { PostClothingItem } from '@/api/generated/schemas';
import { ImageModal } from '@/components/ui/image-modal';
import { Text } from '@/components/ui/text';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';

export function ClothInfo({ item }: { item: PostClothingItem }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenLink = async () => {
    if (!item.link) return;
    try {
      await WebBrowser.openBrowserAsync(item.link);
    } catch {
      Alert.alert('오류', '상품 페이지를 열 수 없습니다.');
    }
  };

  return (
    <>
      {item.imageUrl && (
        <ImageModal
          uri={item.imageUrl}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
      <View className="mx-4 mb-2 rounded-xl border border-border flex-row overflow-hidden">
        <Pressable onPress={() => item.imageUrl && setModalVisible(true)}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: 96, height: 96 }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 bg-surface" />
          )}
        </Pressable>
        <View className="flex-1 flex-row justify-between items-center px-5">
          <View className="flex-1 flex-col gap-3 mr-2">
            <Text className="font-sans-bold text-lg leading-none">{item.brand}</Text>
            {item.size && (
              <Text variant="label" className="text-md text-slate leading-none">
                사이즈 : {item.size}
              </Text>
            )}

            <Text
              variant="caption"
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-md leading-none"
            >
              {item.name}
            </Text>
          </View>
          <Pressable onPress={handleOpenLink} className="p-2 -mr-2">
            <Ionicons name="open-outline" size={24} color="black" />
          </Pressable>
        </View>
      </View>
    </>
  );
}
