import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/utils/cn';

import { getMall, MALLS, type MallId } from '../constants/malls';

type MallDropdownProps = {
  activeMallId: MallId;
  onSelect: (mallId: MallId) => void;
};

type Anchor = { x: number; y: number; width: number; height: number };

/**
 * 상단 몰 선택 드롭다운. 평소엔 현재 몰 배지만 노출하고, 탭하면 몰 목록이
 * 트리거 바로 아래로 펼쳐진다. (Modal로 띄워 WebView 위에 확실히 표시)
 */
export function MallDropdown({ activeMallId, onSelect }: MallDropdownProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const active = getMall(activeMallId);
  const onlyOne = MALLS.length <= 1;

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        hitSlop={6}
        className="flex-row items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white border border-gray-200"
      >
        <View className="w-5 h-5 rounded-md bg-black items-center justify-center">
          <Text className="text-white text-[9px] font-sans-bold">{active.shortLabel}</Text>
        </View>
        <Text className="text-xs font-sans-medium">{active.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#6b7280" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              left: anchor.x,
              top: anchor.y + anchor.height + 4,
              minWidth: Math.max(anchor.width, 150),
            }}
            className="bg-white rounded-xl border border-gray-200 py-1 shadow-lg"
          >
            {MALLS.map((mall) => {
              const isActive = mall.id === activeMallId;
              return (
                <Pressable
                  key={mall.id}
                  onPress={() => {
                    setOpen(false);
                    if (mall.id !== activeMallId) onSelect(mall.id);
                  }}
                  className={cn(
                    'flex-row items-center gap-2 px-3 py-2.5',
                    isActive && 'bg-gray-100',
                  )}
                >
                  <View className="w-5 h-5 rounded-md bg-black items-center justify-center">
                    <Text className="text-white text-[9px] font-sans-bold">{mall.shortLabel}</Text>
                  </View>
                  <Text className="text-sm font-sans-medium flex-1">{mall.label}</Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#111827" />}
                </Pressable>
              );
            })}
            {onlyOne && (
              <View className="px-3 pt-1.5 pb-1 border-t border-gray-100 mt-0.5">
                <Text className="text-[10px] text-gray-400 font-sans">
                  다른 쇼핑몰은 준비 중이에요
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
