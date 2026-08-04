import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import type { TourStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getTourById } from '@/apis/tour/tour-apis';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { OrganizationTourListSection } from '@/components/organization/tour/list/organization-tour-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { TourStatusOptions } from '@/constants/tour-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { OrganizationTourListProvider } from '@/providers/organization/tour/organization-tour-list-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export function OrganizationTourScreenContent() {
  const router = useRouter();
  const { month, day } = useLocalSearchParams<{ month?: string; day?: string }>();
  const { organizationId, can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createTour, isCreatingTour } = useOrganizationActionsContext();

  const [statusFilter, setStatusFilter] = useState<TourStatus | ''>('');
  const [pickerVisible, setPickerVisible] = useState(false);

  // ─── Derive filterMode from URL params ───
  // filterMode must NOT be local state: the tab screen is mounted once, so a useState
  // initializer never re-runs when the user navigates back with a new `day` param.
  const filterMode = day ? 'day' : 'month';

  const selectedDate = day ? dayjs(day, 'YYYY-MM-DD') : month ? dayjs(month, 'YYYY-MM') : dayjs();

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    if (mode === 'month') {
      router.setParams({ month: date.format('YYYY-MM'), day: undefined });
    } else {
      router.setParams({ day: date.format('YYYY-MM-DD'), month: undefined });
    }
  };

  const suspenseKey = `org-tour-list-${organizationId}-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}`;

  const handleAddNew = () => {
    createTour(
      { organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getTourById(data?.id || ''), {
              fetchKey: `organization-tour-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/tour-detail/[tourId]',
            params: { tourId: data ? data.id : '' },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo tour mới')),
      },
    );
  };

  return (
    <View style={styles.container}>
      {can(PERMISSION_ACTION.CREATE, PERMISSION_RESOURCE.TOUR) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={require('@/assets/images/add_new.png')}
            iconRenderingMode="original"
            disabled={isCreatingTour}
            accessibilityLabel="Tạo tour"
            onPress={handleAddNew}
          />
        </Stack.Toolbar>
      )}
      <View style={styles.tourTopContainer}>
        <PressableOpacity onPress={() => setPickerVisible(true)} style={styles.datePickerTrigger}>
          <FontAwesome5
            name="calendar-alt"
            size={ICON_SIZES.sm}
            color={COLORS.teal700}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.dateText}>
            {filterMode === 'month'
              ? selectedDate.format(MM_YYYY_DATE_FORMAT)
              : selectedDate.format(DD_MM_YYYY_DATE_FORMAT)}
          </Text>
        </PressableOpacity>
        <FilterSelect
          placeholder="Trạng thái"
          options={TourStatusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          align="right"
        />
      </View>
      <UnifiedDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        value={selectedDate}
        currentMode={filterMode}
        modes={['day', 'month']}
        onChange={handleDateChange}
      />
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <OrganizationTourListProvider
          key={suspenseKey}
          organizationId={organizationId}
          selectedDate={selectedDate}
          statusFilter={statusFilter || undefined}
          filterMode={filterMode}
        >
          <OrganizationTourListSection
            organizationId={organizationId}
            statusFilter={statusFilter || undefined}
          />
        </OrganizationTourListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tourTopContainer: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
});
