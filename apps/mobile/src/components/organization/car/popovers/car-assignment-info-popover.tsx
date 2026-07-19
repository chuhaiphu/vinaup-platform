import Fontisto from '@react-native-vector-icons/fontisto/static';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Popover } from '@/components/primitives/popover';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';

interface CarAssignmentInfoPopoverProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CarAssignmentInfoPopover({ isVisible, onClose }: CarAssignmentInfoPopoverProps) {
  return (
    <Popover
      isVisible={isVisible}
      onClose={onClose}
      variant="info"
      title="Tip"
      position={{ top: 320, left: 8, right: 8 }}
    >
      <View style={styles.textBlock}>
        <Text style={styles.textContent}>Ghép xe vào nhân viên tổ chức gồm 3 bước</Text>
        <Text style={styles.textContent}>
          1. <Text style={styles.bold}>Tạo</Text> nhân viên thuộc tổ chức của bạn
        </Text>
        <Text style={styles.textContent}>
          2. <Text style={styles.bold}>Liên kết</Text> nhân viên tổ chức và tài khoản cá nhân
        </Text>
        <Text style={styles.textContent}>
          3. <Text style={styles.bold}>Ghép</Text> nhân viên tổ chức vào xe
        </Text>

        <View style={styles.diagramRow}>
          <Text style={styles.diagramText}>Xe</Text>
          <Fontisto name="arrow-h" size={ICON_SIZES.sm} color={COLORS.gray600} />
          <Text style={[styles.diagramText, { color: COLORS.red600 }]}>Nhân viên tổ chức</Text>
          <Fontisto name="arrow-h" size={ICON_SIZES.sm} color={COLORS.gray600} />
          <Text style={styles.diagramText}>Tài khoản cá nhân</Text>
        </View>
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  textBlock: {
    gap: SPACING.sm,
  },
  textContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  diagramText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray700,
  },
});
