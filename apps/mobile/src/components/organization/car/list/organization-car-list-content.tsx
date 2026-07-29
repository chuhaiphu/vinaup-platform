import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { getCarById } from '@/apis/car/car-apis';
import { CarCard } from '@/components/organization/car/list/car-card';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import {
  CAR_OPERATIONAL_STATUS,
  CarOperationalStatusFilterOptions,
  CarStatusFilterOptions,
  getCarSeatCountFilterOptions,
} from '@/constants/car-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationCarListContext } from '@/providers/organization/car/organization-car-list-provider';

interface OrganizationCarListContentProps {
  selectedDate: dayjs.Dayjs;
  filterMode: DatePickerMode;
  onDateChange: (date: dayjs.Dayjs, mode: DatePickerMode) => void;
}

export function OrganizationCarListContent({
  selectedDate,
  filterMode,
  onDateChange,
}: OrganizationCarListContentProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { cars, refreshFetch, isRefreshing } = useOrganizationCarListContext();

  const [pickerVisible, setPickerVisible] = useState(false);

  // ─── Client-side filters over the fetched list ─────
  const [seatCountFilter, setSeatCountFilter] = useState('');
  const [operationalStatusFilter, setOperationalStatusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Seat-count options mirror the seat counts that truly exist in the org's fleet.
  const seatCountOptions = useMemo(() => getCarSeatCountFilterOptions(cars), [cars]);

  const filteredCars = useMemo(
    () =>
      cars.filter((car) => {
        if (seatCountFilter && String(car.seatCount ?? '') !== seatCountFilter) return false;
        if (
          operationalStatusFilter &&
          (car.meta?.operationalStatus ?? CAR_OPERATIONAL_STATUS.RESTING) !==
            operationalStatusFilter
        )
          return false;
        if (statusFilter && car.status !== statusFilter) return false;
        return true;
      }),
    [cars, seatCountFilter, operationalStatusFilter, statusFilter],
  );

  const dateLabel =
    filterMode === 'month'
      ? selectedDate.format(MM_YYYY_DATE_FORMAT)
      : selectedDate.format(DD_MM_YYYY_DATE_FORMAT);

  const navigateToDetailScreen = async (id?: string) => {
    if (!id) return;
    setIsNavigating(true);
    try {
      await prefetch(() => getCarById(id), { fetchKey: `organization-car-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/car-detail/[carId]',
      params: { carId: id },
    });
    setIsNavigating(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <View style={styles.filterRow}>
          <View style={styles.dateFilter}>
            <PressableOpacity
              onPress={() => setPickerVisible(true)}
              style={styles.datePickerTrigger}
            >
              <FontAwesome5
                name="calendar-alt"
                size={ICON_SIZES.sm}
                color={COLORS.teal700}
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>{dateLabel}</Text>
            </PressableOpacity>
          </View>
          <FilterSelect
            placeholder="Hoạt động"
            options={CarOperationalStatusFilterOptions}
            value={operationalStatusFilter}
            onChange={setOperationalStatusFilter}
            align="right"
          />
        </View>
        <View style={styles.rowSeparator} />
        <View style={styles.filterRow}>
          <FilterSelect
            placeholder="Số chỗ"
            options={seatCountOptions}
            value={seatCountFilter}
            onChange={setSeatCountFilter}
          />
          <FilterSelect
            placeholder="Kỹ thuật"
            options={CarStatusFilterOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            align="right"
          />
        </View>
      </View>

      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode={filterMode}
        modes={['day', 'month']}
        onChange={onDateChange}
      />

      <FlatList
        data={filteredCars}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigateToDetailScreen(item.id)}>
            <CarCard car={item} />
          </Pressable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFetch}
            colors={[COLORS.teal700]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateFilter: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  datePickerTrigger: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  rowSeparator: {
    marginVertical: SPACING.sm,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.gray200,
  },
  separator: {
    height: 2,
  },
});
