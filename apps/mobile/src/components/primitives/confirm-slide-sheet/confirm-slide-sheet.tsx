import { useImperativeHandle, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/primitives/button';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export interface ConfirmSlideSheetContentRef {
  submit: () => void;
}

interface ConfirmSlideSheetProps {
  /** Imperative open()/close() — unified across every modal call-site. */
  ref?: React.RefObject<SlideSheetRef | null>;
  title?: string;
  /**
   * Replace the entire default title row with custom content (e.g. title + an
   * action icon on the same line). When provided, `title` is ignored.
   */
  renderHeader?: () => React.ReactNode;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  /** Hide the confirm button (e.g. option-only modals such as PDF page size). */
  hideConfirm?: boolean;
  /** Forwarded to SlideSheet to fix the sheet height; omit to fit content. */
  heightPercentage?: number;
  /**
   * Wrap the body in a built-in ScrollView (default).
   * Set `false` for bodies that manage their own scrolling/fill
   */
  scrollable?: boolean;
  /** Fired after the open animation completes (e.g. to focus an input). */
  onOpenCompleted?: () => void;
  /** Confirm button pressed. For form bodies, wire to `modalContentRef.current?.submit()`. */
  onConfirmPress?: () => void;
  /** Fired once after the sheet finishes closing (cancel button or backdrop). */
  onCloseCompleted?: () => void;
  children?: React.ReactNode;
}

export function ConfirmSlideSheet({
  ref,
  title,
  renderHeader,
  isLoading = false,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  confirmDisabled = false,
  hideConfirm = false,
  heightPercentage,
  scrollable = true,
  onOpenCompleted,
  onConfirmPress,
  onCloseCompleted,
  children,
}: ConfirmSlideSheetProps) {
  // ─── Own the SlideSheet ref internally ─────
  // The parent also needs open()/close().
  // So we keep an internal ref + re-expose it via useImperativeHandle.
  const sheetRef = useRef<SlideSheetRef | null>(null);
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    open: (onImperativeOpenCompleted?: () => void) =>
      sheetRef.current?.open(onImperativeOpenCompleted),
    close: (onImperativeCloseCompleted?: () => void) =>
      sheetRef.current?.close(onImperativeCloseCompleted),
  }));

  const handleCancel = () => {
    if (isLoading) return;
    sheetRef.current?.close();
  };

  return (
    <SlideSheet
      ref={sheetRef}
      heightPercentage={heightPercentage}
      onOpenCompleted={onOpenCompleted}
      onCloseCompleted={onCloseCompleted}
    >
      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom },
          // Fixed height fills the sheet
          // otherwise let the container shrink to the sheet's capped maxHeight.
          heightPercentage ? styles.containerFlex : scrollable ? styles.containerShrink : null,
        ]}
      >
        {renderHeader ? renderHeader() : title ? <Text style={styles.title}>{title}</Text> : null}

        {scrollable ? (
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
            {children}
          </ScrollView>
        ) : (
          children
        )}

        <View style={styles.footer}>
          <Button
            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </Button>
          {!hideConfirm && (
            <Button
              style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
              onPress={onConfirmPress}
              disabled={isLoading || confirmDisabled}
              isLoading={isLoading}
              loaderStyle={{ color: COLORS.white }}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </Button>
          )}
        </View>
      </View>
    </SlideSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  containerFlex: {
    flex: 1,
  },
  // Lets the container shrink to the sheet's capped maxHeight (content-sized + scrollable)
  containerShrink: {
    flexShrink: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.teal900,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
  confirmButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.teal700,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
