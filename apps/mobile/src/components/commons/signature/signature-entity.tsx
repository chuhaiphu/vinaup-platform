import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import VinaupSigningPen from '@/components/icons/vinaup-signing-pen.native';
import { Button } from '@/components/primitives/button';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

interface Props {
  isSigned?: boolean;
  isAllowToSign?: boolean;
  isAllowToCancel?: boolean;
  role?: 'SENDER' | 'RECEIVER';
  isLoading?: boolean;
  unsignedText?: string;
  signedText?: string;
  cancelText?: string;
  alignment?: 'left' | 'right';
  onSign?: () => void;
  onCancel?: () => void;
}

export default function SignatureEntity({
  isSigned = false,
  isAllowToSign = false,
  isAllowToCancel = false,
  role = 'SENDER',
  isLoading = false,
  unsignedText = 'Chờ ký',
  signedText = 'Đã ký',
  cancelText = 'Huỷ',
  alignment = 'left',
  onSign,
  onCancel,
}: Props) {
  const ActionBlock = (() => {
    if (isAllowToSign) {
      return (
        <Button onPress={onSign} disabled={isLoading} style={styles.actionTouch}>
          <VinaupSigningPen width={20} height={20} color={COLORS.teal700} />
        </Button>
      );
    }

    if (isAllowToCancel) {
      return (
        <Button
          onPress={onCancel}
          disabled={isLoading}
          style={[styles.cancelButton, isLoading && styles.cancelButtonDisabled]}
        >
          <Text style={styles.cancelButtonText}>{cancelText}</Text>
        </Button>
      );
    }

    return <VinaupSigningPen width={20} height={20} color={COLORS.gray400} />;
  })();
  const TextBlock = (
    <Text style={[styles.text, isSigned && { color: COLORS.red600 }]}>
      {isSigned ? signedText : unsignedText}
    </Text>
  );

  const renderContent = () => {
    if (role === 'SENDER') {
      return (
        <>
          {ActionBlock}
          {TextBlock}
          {/* {LockBlock} */}
        </>
      );
    }
    return (
      <>
        {/* {LockBlock} */}
        {TextBlock}
        {ActionBlock}
      </>
    );
  };

  return (
    <View style={[styles.container, alignment === 'right' ? styles.right : styles.left]}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {},
  right: {
    justifyContent: 'flex-end',
  },
  text: {
    marginHorizontal: SPACING.sm,
    color: COLORS.gray400,
  },
  actionTouch: {},
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING['2xs'],
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.red600,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cancelButtonDisabled: {
    opacity: 0.7,
  },
});
