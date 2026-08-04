import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CarSelectModal } from '@/components/commons/modals/car-select-modal/car-select-modal';
import { ReceiptPaymentListInCarMaintenanceLog } from '@/components/commons/receipt-payment/receipt-payment-list-in-car-maintenance-log';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useReceiptPaymentCategoryContext } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { ReceiptPaymentListInCarMaintenanceLogProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-car-maintenance-log-provider';
import { useOrganizationCarListContext } from '@/providers/organization/car/organization-car-list-provider';

export function CarMaintenanceLogScreenContent() {
  const router = useRouter();
  // `carId` lives on the URL (not local state) so the screen is deep-linkable:
  // opened from a car it arrives pre-selected, opened from the list it arrives empty.
  const { organizationId, carId } = useLocalSearchParams<{
    organizationId: string;
    carId?: string;
  }>();
  const { cars } = useOrganizationCarListContext();
  const { categories } = useReceiptPaymentCategoryContext();

  const carSelectModalRef = useRef<SlideSheetRef>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  // This screen filters maintenance costs by year only; the picker exposes a single 'year' mode.
  const [filterMode, setFilterMode] = useState<DatePickerMode>('year');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedCar = cars.find((car) => car.id === carId) ?? null;
  const carMaintenanceLogId = selectedCar?.carMaintenanceLog?.id ?? null;

  // ─── Auto-open the car picker when no car is pre-selected ─────
  useEffect(() => {
    if (!carId) {
      carSelectModalRef.current?.open();
    }
  }, [carId]);

  const navigateToCreate = () => {
    if (!carMaintenanceLogId) return;
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: 'new',
        organizationId,
        carMaintenanceLogId,
        receiptPaymentType: 'PAYMENT',
      },
    });
  };

  const categoryOptions = [
    { value: '', label: 'Tất cả' },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    setFilterMode(mode);
    setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      {!!carMaintenanceLogId && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={require('@/assets/images/add_new.png')}
            iconRenderingMode="original"
            accessibilityLabel="Tạo bản ghi"
            onPress={navigateToCreate}
          />
        </Stack.Toolbar>
      )}
      <View style={styles.filterRow}>
        <PressableOpacity
          style={styles.carTrigger}
          onPress={() => carSelectModalRef.current?.open()}
        >
          <Text style={styles.carTriggerText} numberOfLines={1}>
            {selectedCar?.name || 'Chọn xe'}
          </Text>
          <FontAwesome6
            iconStyle="solid"
            name="caret-down"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
          />
        </PressableOpacity>
        <FilterSelect
          placeholder="Thể loại"
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
          align="right"
        />
      </View>

      <View style={styles.dateRow}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>{selectedDate.format(YYYY_DATE_FORMAT)}</Text>
        </PressableOpacity>
      </View>

      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode={filterMode}
        modes={['year']}
        onChange={handleDateChange}
      />

      <CarSelectModal
        modalRef={carSelectModalRef}
        cars={cars}
        selectedCarId={carId ?? null}
        disableLockedCars={false}
        onSelect={(car) => router.setParams({ carId: car.id })}
      />

      <View style={styles.body}>
        {!carMaintenanceLogId ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chọn xe để xem nhật ký chi phí bảo trì</Text>
          </View>
        ) : (
          <Suspense fallback={<EntityListSectionSkeleton />}>
            <ReceiptPaymentListInCarMaintenanceLogProvider
              key={carMaintenanceLogId}
              carMaintenanceLogId={carMaintenanceLogId}
            >
              <ReceiptPaymentListInCarMaintenanceLog
                carMaintenanceLogId={carMaintenanceLogId}
                organizationId={organizationId}
                categoryFilter={categoryFilter}
                selectedDate={selectedDate}
                filterMode={filterMode}
              />
            </ReceiptPaymentListInCarMaintenanceLogProvider>
          </Suspense>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  filterRow: {
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  carTrigger: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  carTriggerText: {
    flexShrink: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  dateRow: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  body: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
