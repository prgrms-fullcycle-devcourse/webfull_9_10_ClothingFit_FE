import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { OrbitControls } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import * as FileSystem from 'expo-file-system/legacy';

import { Text } from '@/components/ui/text';
import { Model } from './model';

type Props = { modelUrl: string };

export function ClosetViewer3D({ modelUrl }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const uri = (FileSystem.cacheDirectory ?? '') + 'closet_model.glb';
    FileSystem.downloadAsync(modelUrl, uri)
      .then(() => setLocalUri(uri))
      .catch(() => setError(true));
  }, [modelUrl]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="caption">3D 모델을 불러오지 못했어요</Text>
      </View>
    );
  }

  if (!localUri) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="caption">불러오는 중...</Text>
      </View>
    );
  }

  return (
    <Canvas style={{ flex: 1 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={0.8} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[2, 4, 3]} intensity={1.2} />
      <Model uri={localUri} />
      <OrbitControls />
    </Canvas>
  );
}
