import { useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View, Keyboard, Pressable } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { ReceiptPaymentDepositType } from '@/constants/receipt-payment-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';

export interface DepositInputValue {
  depositAmount: string;
  depositType: ReceiptPaymentDepositType;
}

interface DepositInputModalContentProps {
  amount?: string;
  depositType?: ReceiptPaymentDepositType;
  onSubmit?: (value: DepositInputValue) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function DepositInputModalContent({
  amount,
  depositType: initialDepositType,
  onSubmit,
  ref,
}: DepositInputModalContentProps) {
  const [rawAmount, setRawAmount] = useState(amount || '');
  const [depositType, setDepositType] = useState<ReceiptPaymentDepositType>(
    initialDepositType || 'BANK',
  );
  const { displayValue, onDisplayValueChange } = useFormatIntegerInput(rawAmount, setRawAmount);

  const handleConfirm = () => {
    Keyboard.dismiss();
    onSubmit?.({ depositAmount: rawAmount, depositType });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <FlatTextInput
        label="Số tiền đặt cọc"
        value={displayValue}
        onChangeText={onDisplayValueChange}
        alignLabel="left"
        alignValue="left"
        keyboardType="numeric"
        placeholder="0"
        labelRightSection={
          <View style={styles.bankCashSwitcher}>
            <Pressable onPress={() => setDepositType('BANK')}>
              <Text
                style={[
                  styles.bankCashSwitcherText,
                  depositType === 'BANK' && styles.bankCashSwitcherTextActive,
                ]}
              >
                Bank (CK)
              </Text>
            </Pressable>
            <Text style={styles.bankCashSwitcherSeparator}>|</Text>
            <Pressable onPress={() => setDepositType('CASH')}>
              <Text
                style={[
                  styles.bankCashSwitcherText,
                  depositType === 'CASH' && styles.bankCashSwitcherTextActive,
                ]}
              >
                Cash (TM)
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bankCashSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginLeft: 'auto',
  },
  bankCashSwitcherText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  bankCashSwitcherTextActive: {
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  bankCashSwitcherSeparator: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
