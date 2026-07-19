import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import { useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native';

import { CarPropertySelectModal } from '@/components/organization/car/modals/car-property-select-modal/car-property-select-modal';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelectOption } from '@/components/primitives/single-select/types';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { FUEL_TYPE, FuelType, FuelTypeDisplay } from '@/constants/car-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, RADIUS, SPACING } from '@/constants/style-constants';
import { useFormatDecimalInput } from '@/hooks/use-format-decimal-input';
import { useFormatIntegerInput } from '@/hooks/use-format-integer-input';
import { FuelPriceResponse } from '@/interfaces/fuel-price-interfaces';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

import { CarFuelDepreciationModalData } from './car-fuel-depreciation-modal';

interface CarFuelDepreciationModalContentProps {
  carFuelType?: string | null;
  carFuelConsumption?: number | null;
  carBankMortgageAmount?: number | null;
  fuelPrice: FuelPriceResponse | null;
  isSyncing?: boolean;
  isLoading?: boolean;
  onSyncPress?: () => void;
  onSubmit?: (data: CarFuelDepreciationModalData) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function CarFuelDepreciationModalContent({
  carFuelType,
  carFuelConsumption,
  carBankMortgageAmount,
  fuelPrice,
  isSyncing = false,
  isLoading = false,
  onSyncPress,
  onSubmit,
  ref,
}: CarFuelDepreciationModalContentProps) {
  const [fuelType, setFuelType] = useState(carFuelType ?? '');
  const [rawFuelConsumption, setRawFuelConsumption] = useState(
    carFuelConsumption != null ? String(carFuelConsumption) : '',
  );
  const [rawBankMortgage, setRawBankMortgage] = useState(
    carBankMortgageAmount != null ? String(carBankMortgageAmount) : '',
  );
  const [rawElectricity, setRawElectricity] = useState(
    fuelPrice?.electricity != null ? String(fuelPrice.electricity) : '',
  );
  const bankMortgageInput = useFormatIntegerInput(rawBankMortgage, setRawBankMortgage);
  const electricityInput = useFormatIntegerInput(rawElectricity, setRawElectricity);
  const fuelConsumptionInput = useFormatDecimalInput(rawFuelConsumption, setRawFuelConsumption);

  const fuelTypeSelectModalRef = useRef<SlideSheetRef | null>(null);

  const fuelTypeOptions: SingleSelectOption[] = Object.values(FUEL_TYPE).map((value) => ({
    label: FuelTypeDisplay[value],
    value,
  }));

  const handleOpenFuelTypeSelect = () => {
    if (isLoading) return;
    fuelTypeSelectModalRef.current?.open();
  };

  const handleConfirm = () => {
    Keyboard.dismiss();
    onSubmit?.({
      fuelType: (fuelType as FuelType) || undefined,
      // Empty -> omit; otherwise parse. Avoid `Number(x) || undefined`, which turns a
      // legitimate 0 into undefined and silently drops it (e.g. a fully-paid mortgage = 0).
      fuelConsumption: rawFuelConsumption.trim() === '' ? undefined : Number(rawFuelConsumption),
      bankMortgageAmount: rawBankMortgage.trim() === '' ? undefined : Number(rawBankMortgage),
      electricity: Number(rawElectricity),
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  return (
    <View>
      <View style={styles.groupContainer}>
        <View style={styles.groupTitleRow}>
          <Text style={styles.groupTitle}>Bảng giá nhiên liệu</Text>
          <PressableOpacity onPress={onSyncPress} disabled={isSyncing || isLoading} hitSlop={8}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={COLORS.teal700} />
            ) : (
              <FontAwesome6
                iconStyle="solid"
                name="arrows-rotate"
                size={ICON_SIZES.sm}
                color={COLORS.teal700}
              />
            )}
          </PressableOpacity>
        </View>

        <FlatTextInput
          label="Giá xăng 95-V"
          value={fuelPrice ? generateLocaleFormatString(fuelPrice.e10Ron95) : ''}
          onChangeText={() => {}}
          placeholder="..."
          editable={false}
          valueRightSection={<Text style={styles.unitText}>đ / lít</Text>}
        />
        <FlatTextInput
          label="Giá xăng E10-V"
          value={fuelPrice ? generateLocaleFormatString(fuelPrice.e5Ron92) : ''}
          onChangeText={() => {}}
          placeholder="..."
          editable={false}
          valueRightSection={<Text style={styles.unitText}>đ / lít</Text>}
        />
        <FlatTextInput
          label="Giá dầu Diesel-V"
          value={fuelPrice ? generateLocaleFormatString(fuelPrice.diesel) : ''}
          onChangeText={() => {}}
          placeholder="..."
          editable={false}
          valueRightSection={<Text style={styles.unitText}>đ / lít</Text>}
        />
        <FlatTextInput
          label="Giá điện"
          value={electricityInput.displayValue}
          onChangeText={electricityInput.onDisplayValueChange}
          keyboardType="numeric"
          placeholder="..."
          editable={!isLoading}
          valueRightSection={<Text style={styles.unitText}>đ / kWh</Text>}
        />
      </View>

      <View style={styles.groupContainer}>
        <View style={styles.groupTitleRow}>
          <Text style={styles.groupTitle}>Khấu hao</Text>
        </View>

        <FlatTextInput
          label="Hao nhiên liệu / km"
          value={fuelConsumptionInput.displayValue}
          onChangeText={fuelConsumptionInput.onDisplayValueChange}
          keyboardType="decimal-pad"
          placeholder="..."
          editable={!isLoading}
          labelRightSection={
            <PressableOpacity style={styles.fuelTypeTrigger} onPress={handleOpenFuelTypeSelect}>
              <Text
                style={[styles.fuelTypeTriggerText, !fuelType && styles.fuelTypeTriggerPlaceholder]}
                numberOfLines={1}
              >
                {fuelType ? FuelTypeDisplay[fuelType as FuelType] : 'Chọn nhiên liệu'}
              </Text>
              <FontAwesome6
                iconStyle="solid"
                name="caret-down"
                size={ICON_SIZES.md}
                color={COLORS.teal700}
              />
            </PressableOpacity>
          }
          valueRightSection={
            <Text style={styles.unitText}>{fuelType === FUEL_TYPE.ELECTRIC ? 'kWh' : 'lít'}</Text>
          }
        />
        <FlatTextInput
          label="Xác xe / Bank"
          value={bankMortgageInput.displayValue}
          onChangeText={bankMortgageInput.onDisplayValueChange}
          keyboardType="numeric"
          placeholder="..."
          editable={!isLoading}
          valueRightSection={<Text style={styles.unitText}>đ / ngày</Text>}
        />
      </View>

      <CarPropertySelectModal
        modalRef={fuelTypeSelectModalRef}
        title="Nhiên liệu"
        options={fuelTypeOptions}
        value={fuelType}
        onConfirm={setFuelType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.teal700,
    boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  groupTitle: {
    fontSize: FONT_SIZES.base,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  fuelTypeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginLeft: SPACING.md,
  },
  fuelTypeTriggerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  fuelTypeTriggerPlaceholder: {
    color: COLORS.gray400,
  },
});
