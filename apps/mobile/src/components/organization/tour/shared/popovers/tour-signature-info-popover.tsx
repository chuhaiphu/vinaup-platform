// src/components/tour-calculation-popover.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Popover } from '@/components/primitives/popover';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

export interface TourSignatureInfoPopoverRef {
  open: () => void;
  close: () => void;
}

interface TourSignatureInfoPopoverProps {
  isVisible: boolean;
  onClose: () => void;
}

export function TourSignatureInfoPopover({ isVisible, onClose }: TourSignatureInfoPopoverProps) {
  return (
    <Popover
      isVisible={isVisible}
      onClose={onClose}
      variant="info"
      title="Chữ ký được huỷ"
      style={{ container: styles.inlineContainer }}
    >
      <View style={styles.topTextBlock}>
        <Text style={styles.textContent}>
          Ký tên là được <Text style={{ color: COLORS.blue600 }}>&quot;Huỷ ký&quot;</Text>
        </Text>
        <Text style={[styles.textContent, { fontStyle: 'italic' }]}>
          Có nhật ký hủy để đối chiếu nội dung
        </Text>
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
  topTextBlock: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  textContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
