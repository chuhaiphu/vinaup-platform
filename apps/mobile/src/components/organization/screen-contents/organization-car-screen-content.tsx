import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupLeftArrowBigHead from '@/components/icons/vinaup-left-arrow-big-head.native';
import { OrganizationCarListContent } from '@/components/organization/car/list/organization-car-list-content';
import { OrganizationTripListSection } from '@/components/organization/trip/list/organization-trip-list-section';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { OrganizationCarListProvider } from '@/providers/organization/car/organization-car-list-provider';
import { OrganizationTripListProvider } from '@/providers/organization/trip/organization-trip-list-provider';

export function OrganizationCarScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    organizationId: string;
    carView?: string;
    month?: string;
    day?: string;
  }>();
  const { organizationId, month, day } = params;

  const carView = params.carView === 'trips' ? 'trips' : 'cars';

  const [pickerVisible, setPickerVisible] = useState(false);

  // ─── Derive filterMode from URL params ───
  // Shared by both views so the picked period survives toggling cars ↔ trips.
  const filterMode = day ? 'day' : 'month';

  // Both views are always looking at some day — neither param present just means "today".
  // There is no "no period" state: the day is a lens on the fleet, not a filter over it.
  const viewedDate = day ? dayjs(day, 'YYYY-MM-DD') : month ? dayjs(month, 'YYYY-MM') : dayjs();

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    if (mode === 'month') {
      router.setParams({ month: date.format('YYYY-MM'), day: undefined });
    } else {
      router.setParams({ day: date.format('YYYY-MM-DD'), month: undefined });
    }
  };

  const formatDateSuffix = (date: dayjs.Dayjs) =>
    filterMode === 'month' ? date.format('YYYY-MM') : date.format('YYYY-MM-DD');

  const dateHeader = (
    <>
      <View style={styles.dateHeader}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>
            {filterMode === 'month'
              ? viewedDate.format(MM_YYYY_DATE_FORMAT)
              : viewedDate.format(DD_MM_YYYY_DATE_FORMAT)}
          </Text>
        </PressableOpacity>
      </View>
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={viewedDate}
        currentMode={filterMode}
        modes={['day', 'month']}
        onChange={handleDateChange}
      />
    </>
  );

  if (carView === 'trips') {
    const suspenseKey = `org-trip-list-${organizationId}-${filterMode}-${formatDateSuffix(viewedDate)}`;

    return (
      <View style={styles.container}>
        {dateHeader}
        <Suspense fallback={<EntityListSectionSkeleton />}>
          <OrganizationTripListProvider
            key={suspenseKey}
            organizationId={organizationId}
            selectedDate={viewedDate}
            filterMode={filterMode}
          >
            <OrganizationTripListSection />
          </OrganizationTripListProvider>
        </Suspense>
      </View>
    );
  }

  const suspenseKey = `org-car-list-${organizationId}-${filterMode}-${formatDateSuffix(viewedDate)}`;

  return (
    <View style={styles.container}>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationCarListProvider
          key={suspenseKey}
          organizationId={organizationId}
          selectedDate={viewedDate}
          filterMode={filterMode}
        >
          <OrganizationCarListContent
            selectedDate={viewedDate}
            filterMode={filterMode}
            onDateChange={handleDateChange}
          />
        </OrganizationCarListProvider>
        <PressableOpacity
          style={styles.maintenanceLogPin}
          onPress={() =>
            router.push({
              pathname: '/(protected)/car-maintenance-log',
              params: { organizationId },
            })
          }
        >
          <View style={styles.maintenanceLogPinLeft}>
            <MaterialCommunityIcons name="car-wrench" size={ICON_SIZES.md} color={COLORS.teal700} />
            <Text style={styles.maintenanceLogPinText}>Nhật ký chi phí bảo trì</Text>
          </View>
          <VinaupLeftArrowBigHead width={16} height={16} />
        </PressableOpacity>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  dateHeader: {
    marginBottom: SPACING.md,
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
  maintenanceLogPin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  maintenanceLogPinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  maintenanceLogPinText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});
