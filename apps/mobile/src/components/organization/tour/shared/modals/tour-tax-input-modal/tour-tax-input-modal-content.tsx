import { useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';

export interface TourTaxInputRef {
  focus: () => void;
  submit: () => void;
}
interface TourTaxInputModalContentProps {
  initialTaxRate?: number;
  isLoading?: boolean;
  onSubmit?: (taxRate: number) => void;
  ref?: React.RefObject<TourTaxInputRef | null>;
}

export function TourTaxInputModalContent({
  initialTaxRate = 0,
  isLoading = false,
  onSubmit,
  ref,
}: TourTaxInputModalContentProps) {
  const [taxRate, setTaxRate] = useState(
    initialTaxRate.toString() === '0' ? '' : initialTaxRate.toString(),
  );
  const inputRef = useRef<TextInput>(null);

  const handleConfirm = () => {
    const numericTax = Number.parseFloat(taxRate) || 0;
    onSubmit?.(numericTax);
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
      inputRef.current?.setNativeProps({
        selection: { start: taxRate.length, end: taxRate.length },
      });
    },
    submit: handleConfirm,
  }));

  return (
    <View>
      <View style={styles.inputItem}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.inputNative}
            placeholder="0"
            keyboardType="decimal-pad"
            value={taxRate}
            onChangeText={setTaxRate}
            placeholderTextColor={COLORS.gray400}
            editable={!isLoading}
          />
          <View style={styles.suffixSection}>
            <Text style={styles.suffixLabel}>%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputItem: {
    width: '100%',
    marginVertical: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.teal700,
    overflow: 'hidden',
    paddingRight: SPACING.sm,
  },
  inputNative: {
    flex: 1,
    textAlign: 'right',
    fontSize: FONT_SIZES.lg,
    paddingRight: SPACING.sm,
    color: '#000',
  },
  suffixSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  suffixLabel: {
    color: 'black',
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
