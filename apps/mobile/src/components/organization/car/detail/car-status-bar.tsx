import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import VinaupVerticalExpandArrow from '@/components/icons/vinaup-vertical-expand-arrow.native';
import { Badge } from '@/components/primitives/badge';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  CAR_OPERATIONAL_STATUS,
  CarOperationalStatusDisplay,
  CarOperationalStatusVariant,
  CarStatus,
  CarStatusDisplay,
  CarStatusOptions,
} from '@/constants/car-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

export function CarStatusBar() {
  const { car, isUpdatingCar, isRefreshingCar, handleUpdateCar } = useCarDetailContext();
  const sheetRef = useRef<SlideSheetRef>(null);

  // Operational status is derived server-side and delivered via meta
  const operationalStatus = car.meta?.operationalStatus ?? CAR_OPERATIONAL_STATUS.RESTING;

  return (
    <View style={styles.container}>
      <Badge variant={CarOperationalStatusVariant[operationalStatus]}>
        {CarOperationalStatusDisplay[operationalStatus]}
      </Badge>
      {isUpdatingCar || isRefreshingCar ? (
        <ActivityIndicator size="small" color={COLORS.teal700} />
      ) : (
        <PressableOpacity style={styles.technicalStatus} onPress={() => sheetRef.current?.open()}>
          <VinaupVerticalExpandArrow width={16} height={16} />
          <Text style={styles.technicalStatusText}>{CarStatusDisplay[car.status]}</Text>
        </PressableOpacity>
      )}
      <SlideSheet ref={sheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Trạng thái</Text>
        </View>
        <SingleSelect
          options={CarStatusOptions}
          value={car.status}
          onSelectOption={(val) =>
            sheetRef.current?.close(() => handleUpdateCar({ status: val as CarStatus }))
          }
        />
      </SlideSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  technicalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  technicalStatusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  sheetHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
