import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, Image, StyleSheet, View } from 'react-native';

import VinaupImageUpload from '@/components/icons/vinaup-image-upload.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, ICON_SIZES, RADIUS } from '@/constants/style-constants';

interface ImageUploadProps {
  /** URL (đã upload) hoặc local uri (vừa chọn, chưa upload) để hiển thị; null → ô trống. */
  imageUri?: string | null;
  size?: number;
  disabled?: boolean;
  /** Loader do consumer điều khiển (khi consumer đang upload/xoá). */
  isLoading?: boolean;
  /** Có → hiện Alert xác nhận trước khi xoá; không → xoá ngay. */
  confirmRemoveMessage?: string;
  /** Người dùng vừa chọn 1 ảnh. Consumer quyết upload ngay hay lưu lại upload sau. */
  onPick?: (asset: ImagePicker.ImagePickerAsset) => void;
  /** Người dùng bấm thùng rác (sau khi xác nhận, nếu có). */
  onRemove?: () => void;
}

/**
 * Ô upload ảnh — controlled & presentational: KHÔNG gọi api, KHÔNG tự upload.
 * Chỉ lo: mở picker → emit `onPick`, hiển thị theo `imageUri`, loader theo `isLoading`,
 * và phát `onRemove`. Việc upload/xoá thật do consumer làm (qua fetchwire).
 */
export function ImageUpload({
  imageUri,
  size = 80,
  disabled = false,
  isLoading = false,
  confirmRemoveMessage,
  onPick,
  onRemove,
}: ImageUploadProps) {
  const handlePick = async () => {
    if (isLoading || disabled) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled) return;

    onPick?.(result.assets[0]);
  };

  const handleRemovePress = () => {
    if (isLoading || disabled) return;
    if (!confirmRemoveMessage) {
      onRemove?.();
      return;
    }
    Alert.alert(confirmRemoveMessage, undefined, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => onRemove?.() },
    ]);
  };

  const tileStyle = [styles.tile, { width: size, height: size }];

  if (isLoading) {
    return (
      <View style={[tileStyle, styles.centerContent]}>
        <ActivityIndicator color={COLORS.teal700} size={size * 0.5} />
      </View>
    );
  }

  if (imageUri) {
    return (
      <View style={tileStyle}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <PressableOpacity
          style={styles.removeButton}
          onPress={handleRemovePress}
          disabled={disabled}
          hitSlop={6}
        >
          <FontAwesome name="trash-o" size={ICON_SIZES.sm} color={COLORS.red600} />
        </PressableOpacity>
      </View>
    );
  }

  return (
    <PressableOpacity
      style={[tileStyle, styles.centerContent, styles.emptyTile]}
      onPress={handlePick}
      disabled={disabled}
    >
      <VinaupImageUpload width={size * 0.5} height={size * 0.5} />
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  emptyTile: {
    borderWidth: 1.5,
    borderColor: COLORS.teal700,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
});
