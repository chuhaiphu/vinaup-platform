import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/primitives/button';
import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

interface PdfPageSizeModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
  isLoading?: boolean;
  onSelectA4: () => void;
  onSelectA5: () => void;
}

export function PdfPageSizeModal({
  modalRef,
  isLoading = false,
  onSelectA4,
  onSelectA5,
}: PdfPageSizeModalProps) {
  return (
    <ConfirmSlideSheet ref={modalRef} title="Chọn khổ giấy PDF" isLoading={isLoading} hideConfirm>
      <View style={styles.optionGroup}>
        <Button
          style={[styles.optionButton, isLoading && styles.buttonDisabled]}
          onPress={onSelectA4}
          disabled={isLoading}
        >
          <Text style={styles.optionButtonText}>A4</Text>
        </Button>
        <Button
          style={[styles.optionButton, isLoading && styles.buttonDisabled]}
          onPress={onSelectA5}
          disabled={isLoading}
        >
          <Text style={styles.optionButtonText}>A5</Text>
        </Button>
      </View>
    </ConfirmSlideSheet>
  );
}

const styles = StyleSheet.create({
  optionGroup: {
    gap: SPACING.md,
  },
  optionButton: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.teal700,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
