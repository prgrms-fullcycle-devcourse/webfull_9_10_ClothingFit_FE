import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, useWindowDimensions } from 'react-native';

type Props = {
  uri: string;
  visible: boolean;
  onClose: () => void;
};

export function ImageModal({ uri, visible, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const maxHeight = height * 0.8;
  const [imgHeight, setImgHeight] = useState(maxHeight);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/90 items-center justify-center" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Image
            source={{ uri }}
            style={{ width, height: imgHeight }}
            resizeMode="contain"
            onLoad={(e) => {
              const { width: nw, height: nh } = e.nativeEvent.source;
              const ratio = nh / nw;
              setImgHeight(Math.min(width * ratio, maxHeight));
            }}
          />
        </Pressable>
        <Pressable onPress={onClose} className="absolute top-12 right-4 p-2">
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
