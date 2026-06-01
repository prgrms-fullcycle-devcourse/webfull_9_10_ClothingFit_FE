import { Asset } from 'expo-asset';
import { loadAsync, THREE } from 'expo-three';
import { useEffect, useState } from 'react';

export function Model({ uri }: { uri: string }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    Asset.fromURI(uri)
      .downloadAsync()
      .then((asset) => loadAsync(asset))
      .then((gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2 / Math.max(size.x, size.y, size.z);
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.copy(center.multiplyScalar(-scale));
        setScene(gltf.scene);
      });
  }, [uri]);

  if (!scene) return null;
  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={scene} />;
}
