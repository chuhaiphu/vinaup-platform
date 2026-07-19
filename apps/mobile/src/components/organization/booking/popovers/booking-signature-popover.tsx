import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Popover } from '@/components/primitives/popover';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

interface BookingSignaturePopoverProps {
  isVisible: boolean;
  onClose: () => void;
}

export function BookingSignaturePopover({ isVisible, onClose }: BookingSignaturePopoverProps) {
  return (
    <Popover
      isVisible={isVisible}
      onClose={onClose}
      variant="info"
      title="Thông tin chữ ký"
      style={{ container: styles.inlineContainer }}
    >
      <View style={styles.textBlock}>
        <Text style={styles.textContent}>(Placeholder)</Text>
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  // This info banner flows inline under the signature area (not floating), so it
  // cancels the primitive's absolute placement and adds its own spacing.
  inlineContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  textBlock: {
    marginBottom: SPACING.sm,
  },
  textContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
