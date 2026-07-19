import { useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/style-constants';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { generateRawNumber } from '@/utils/generator/string-generator/generate-raw-number';

export interface TourTicketData {
  adultPrice: number;
  childPrice: number;
  adultQuantity: number;
  childQuantity: number;
}

interface TourTicketFormModalContentProps {
  initialData?: Partial<TourTicketData>;
  isLoading?: boolean;
  onSubmit?: (data: TourTicketData) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function TourTicketFormModalContent({
  initialData,
  isLoading = false,
  onSubmit,
  ref,
}: TourTicketFormModalContentProps) {
  const [adultPrice, setAdultPrice] = useState(initialData?.adultPrice?.toString() ?? '');
  const [childPrice, setChildPrice] = useState(initialData?.childPrice?.toString() ?? '');
  const [adultQuantity, setAdultQuantity] = useState(initialData?.adultQuantity?.toString() ?? '');
  const [childQuantity, setChildQuantity] = useState(initialData?.childQuantity?.toString() ?? '');

  const { displayValue: displayAdultPrice, onDisplayValueChange: onAdultPriceChange } =
    useFormatIntegerInput(adultPrice, setAdultPrice);
  const { displayValue: displayChildPrice, onDisplayValueChange: onChildPriceChange } =
    useFormatIntegerInput(childPrice, setChildPrice);
  const { displayValue: displayAdultQuantity, onDisplayValueChange: onAdultQuantityChange } =
    useFormatIntegerInput(adultQuantity, setAdultQuantity);
  const { displayValue: displayChildQuantity, onDisplayValueChange: onChildQuantityChange } =
    useFormatIntegerInput(childQuantity, setChildQuantity);

  const handleConfirm = () => {
    onSubmit?.({
      adultPrice: generateRawNumber(adultPrice),
      childPrice: generateRawNumber(childPrice),
      adultQuantity: generateRawNumber(adultQuantity),
      childQuantity: generateRawNumber(childQuantity),
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  const renderInputRow = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    suffix?: string,
  ) => {
    return (
      <View style={styles.inputItem}>
        <View style={styles.inputWrapper}>
          <View style={styles.labelSection}>
            <Text style={styles.insideLabel}>{label}</Text>
          </View>
          <View style={styles.separator} />
          <TextInput
            style={styles.inputNative}
            placeholder="0"
            keyboardType="numeric"
            value={value === '0' ? '' : value}
            onChangeText={onChangeText}
            placeholderTextColor={COLORS.gray400}
            editable={!isLoading}
          />
          {suffix && (
            <View style={styles.suffixSection}>
              <Text style={styles.suffixLabel}>{suffix}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Giá bán dự kiến</Text>
      {renderInputRow('Khách lớn', displayAdultPrice, onAdultPriceChange, 'VND')}
      {renderInputRow('Trẻ em', displayChildPrice, onChildPriceChange, 'VND')}

      <View style={styles.spacing} />

      <Text style={styles.sectionTitle}>Số lượng</Text>
      {renderInputRow('Khách lớn', displayAdultQuantity, onAdultQuantityChange)}
      {renderInputRow('Trẻ em', displayChildQuantity, onChildQuantityChange)}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.blue600,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
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
    minHeight: 50,
    paddingRight: SPACING.sm,
  },
  labelSection: {
    width: 100,
    justifyContent: 'center',
    paddingLeft: SPACING.sm,
  },
  insideLabel: {
    fontSize: FONT_SIZES.lg,
    color: '#333',
  },
  separator: {
    width: 1.5,
    height: '70%',
    backgroundColor: COLORS.gray600,
  },
  inputNative: {
    flex: 1,
    textAlign: 'right',
    fontSize: FONT_SIZES.lg,
  },
  suffixSection: {
    marginLeft: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suffixLabel: {
    color: 'black',
    fontSize: FONT_SIZES.sm,
  },
  spacing: {
    height: 16,
  },
});
