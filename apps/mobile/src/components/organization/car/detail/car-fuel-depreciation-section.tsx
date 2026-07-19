import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import {
  CarFuelDepreciationModal,
  CarFuelDepreciationModalData,
} from '@/components/organization/car/modals/car-fuel-depreciation-modal/car-fuel-depreciation-modal';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { FUEL_TYPE, FuelType, FuelTypeDisplay } from '@/constants/car-constants';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useFuelPriceContext } from '@/providers/commons/fuel-price-provider';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export function CarFuelDepreciationSection() {
  const fuelDepreciationModalRef = useRef<SlideSheetRef>(null);

  const { car, handleUpdateCar, isUpdatingCar } = useCarDetailContext();
  const {
    fuelPrice,
    isSyncingFuelPrice,
    isUpdatingElectricity,
    handleSyncFuelPrice,
    handleUpdateElectricity,
  } = useFuelPriceContext();

  const handleOpenModal = () => {
    fuelDepreciationModalRef.current?.open();
  };

  const handleConfirmFuelDepreciation = (
    data: CarFuelDepreciationModalData,
    closeModal: () => void,
  ) => {
    handleUpdateElectricity({ electricity: data.electricity });
    handleUpdateCar(
      {
        fuelType: data.fuelType,
        fuelConsumption: data.fuelConsumption,
        bankMortgageAmount: data.bankMortgageAmount,
      },
      closeModal,
    );
  };

  const fuelTypeText = car.fuelType ? FuelTypeDisplay[car.fuelType as FuelType] : '';

  const fuelConsumptionText =
    car.fuelConsumption != null
      ? car.fuelType === FUEL_TYPE.ELECTRIC
        ? generateLocaleFormatString(car.fuelConsumption, 'vi-VN', 1)
        : `${generateLocaleFormatString(car.fuelConsumption, 'vi-VN', 1)} lít / km`
      : '';
  const bankMortgageText =
    car.bankMortgageAmount != null
      ? `${generateLocaleFormatString(car.bankMortgageAmount)} đ / ngày`
      : '';

  const rowList: { label: string; valueText: string }[] = [
    { label: 'Nhiên liệu', valueText: fuelTypeText },
    { label: 'Tiêu hao nhiên liệu', valueText: fuelConsumptionText },
    { label: 'Xác xe / Bank', valueText: bankMortgageText },
  ];

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.headerTitle}>Tiêu thụ & Khấu hao</Text>
          <PressableOpacity onPress={handleOpenModal} hitSlop={4}>
            <VinaupPenLineOutline width={16} height={16} color={COLORS.teal700} />
          </PressableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {rowList.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={row.valueText ? styles.rowValue : styles.rowValuePlaceholder}>
                  {row.valueText || '...'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <CarFuelDepreciationModal
        modalRef={fuelDepreciationModalRef}
        car={car}
        fuelPrice={fuelPrice}
        isSyncing={isSyncingFuelPrice}
        onSyncPress={() => handleSyncFuelPrice()}
        isLoading={isUpdatingCar || isUpdatingElectricity}
        onConfirm={handleConfirmFuelDepreciation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green50,
    padding: SPACING.sm,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  section: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  sectionContent: {},
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  rowValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  rowValuePlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
