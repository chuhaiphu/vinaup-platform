import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getCarById } from '@/apis/car/car-apis';
import { getTripById } from '@/apis/trip/trip-apis';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import VinaupLeftArrowBigHead from '@/components/icons/vinaup-left-arrow-big-head.native';
import { OrganizationCarListContent } from '@/components/organization/car/list/organization-car-list-content';
import { OrganizationTripListSection } from '@/components/organization/trip/list/organization-trip-list-section';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { OrganizationCarListProvider } from '@/providers/organization/car/organization-car-list-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { OrganizationTripListProvider } from '@/providers/organization/trip/organization-trip-list-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

type CarViewCode = 'cars' | 'trips';

const CAR_VIEW_ITEMS: SegmentedControlItem<CarViewCode>[] = [
  { value: 'cars', label: 'Tất cả xe' },
  { value: 'trips', label: 'Chuyến xe' },
];

export function OrganizationCarScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    carView?: string;
    month?: string;
    day?: string;
  }>();
  const { organizationId, can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createCar, isCreatingCar, createTrip, isCreatingTrip } = useOrganizationActionsContext();
  const { month, day } = params;

  const carView: CarViewCode = params.carView === 'trips' ? 'trips' : 'cars';

  const [localView, setLocalView] = useState<CarViewCode>(carView);
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

  const handleAddNewCar = () => {
    createCar(
      { organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getCarById(data?.id || ''), {
              fetchKey: `organization-car-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/car-detail/[carId]',
            params: { carId: data?.id || '' },
          });
        },
        onError: (error) => Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo xe mới')),
      },
    );
  };

  const handleAddNewTrip = () => {
    createTrip(
      { organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getTripById(data?.id || ''), {
              fetchKey: `organization-trip-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/trip-detail/[tripId]',
            params: { tripId: data?.id || '' },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo chuyến mới')),
      },
    );
  };

  // The list shown is driven by `carView`, so the "+" creates the entity type on screen.
  const canAddCurrentView =
    carView === 'trips'
      ? can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.TRIP)
      : can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.CAR);

  const addNewToolbar = canAddCurrentView && (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button
        icon={require('@/assets/images/add_new.png')}
        iconRenderingMode="original"
        disabled={isCreatingCar || isCreatingTrip}
        accessibilityLabel={carView === 'trips' ? 'Tạo chuyến' : 'Tạo xe'}
        onPress={carView === 'trips' ? handleAddNewTrip : handleAddNewCar}
      />
    </Stack.Toolbar>
  );

  const viewSegment = (
    <View style={styles.segmentContainer}>
      <SegmentedControl
        items={CAR_VIEW_ITEMS}
        value={localView}
        onChange={setLocalView}
        onSettled={(value) => router.setParams({ carView: value })}
        style={{
          pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
          label: { fontSize: FONT_SIZES.base },
        }}
      />
    </View>
  );

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
        {addNewToolbar}
        {viewSegment}
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
      {addNewToolbar}
      {viewSegment}
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
  segmentContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
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
