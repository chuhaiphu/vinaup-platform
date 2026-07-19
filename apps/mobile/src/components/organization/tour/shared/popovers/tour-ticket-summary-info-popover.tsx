import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Popover } from '@/components/primitives/popover';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

interface TourTicketSummaryInfoPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  label: string;
}

export function TourTicketSummaryInfoPopover({
  isVisible,
  onClose,
  label,
}: TourTicketSummaryInfoPopoverProps) {
  return (
    <Popover isVisible={isVisible} onClose={onClose} variant="info" title="Tip">
      <View style={styles.textBlock}>
        <Text style={styles.textContent}>
          * {label} có thống kê GTGT đầu vào / đầu ra giúp cho việc {label.toLowerCase()} có số liệu
          GTGT chính xác
        </Text>
        <Text style={styles.textContent}>
          * Nếu không nhập vào ô thuế GTGT có nghĩa là lãi trước thuế và ngược lại
        </Text>
        <Text style={styles.textContent}>* Thuế phải nộp = Thuế GTGT - Thuế khấu trừ</Text>
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
});
