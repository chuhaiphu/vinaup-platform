// src/components/tour-calculation-popover.tsx

import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { Popover } from '@/components/primitives/popover';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

interface TourTicketSummaryPopoverProps {
  onPenClick?: () => void;
}

export function TourTicketSummaryPopover({ onPenClick }: TourTicketSummaryPopoverProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handlePenClick = () => {
    if (onPenClick) {
      onPenClick();
    }
    setIsVisible(false);
  };

  return (
    <Popover
      isVisible={isVisible}
      onClose={handleClose}
      variant="info"
      title="Tip"
      position={{ top: 75, left: 8, right: 8 }}
    >
      <View style={styles.topTextBlock}>
        <Text style={styles.textContent}>Bấm vào</Text>
        <PressableOpacity onPress={handlePenClick}>
          <VinaupPenLineOutline width={16} height={16} />
        </PressableOpacity>
        <Text style={styles.textContent}>để nhập giá bán & số lượng</Text>
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  topTextBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  textContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
