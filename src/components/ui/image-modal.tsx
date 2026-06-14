import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, useWindowDimensions } from 'react-native';

type Props = {
  uri: string;
  visible: boolean;
  onClose: () => void;
};

export function ImageModal({ uri, visible, onClose }: Props) {
  const { width, height } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/90 items-center justify-center" onPress={onClose}>
        <Pressable onPress={() => {}} className="w-full">
          <Image source={{ uri }} style={{ width, height: height * 0.8 }} resizeMode="contain" />
        </Pressable>
        <Pressable onPress={onClose} className="absolute top-12 right-4 p-2">
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
