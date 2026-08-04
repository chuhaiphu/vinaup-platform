import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import type { WageStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Suspense, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getWageById } from '@/apis/wage/wage-apis';
import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { PersonalWageListSection } from '@/components/personal/wage/list/personal-wage-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { WageStatusOptions } from '@/constants/wage-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { usePersonalActionsContext } from '@/providers/personal/personal-actions-provider';
import { PersonalWageListProvider } from '@/providers/personal/wage/personal-wage-list-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export function PersonalWageScreenContent() {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const { createWage, isCreatingWage } = usePersonalActionsContext();

  const { month, day } = useLocalSearchParams<{
    month?: string;
    day?: string;
  }>();
  const [statusFilter, setStatusFilter] = useState<WageStatus | ''>('');
  const [pickerVisible, setPickerVisible] = useState(false);

  // ─── Derive filterMode from URL params ───
  // filterMode must NOT be local state
  // Because the tab screen is mounted once
  // and useState initializer never re-runs when the user navigates back to this tab with a new `day` param.
  const filterMode = day ? 'day' : 'month';

  const selectedDate = day ? dayjs(day, 'YYYY-MM-DD') : month ? dayjs(month, 'YYYY-MM') : dayjs();

  const handleDateChange = (date: dayjs.Dayjs, mode: DatePickerMode) => {
    if (mode === 'month') {
      router.setParams({ month: date.format('YYYY-MM'), day: undefined });
    } else {
      router.setParams({ day: date.format('YYYY-MM-DD'), month: undefined });
    }
  };

  const suspenseKey = `personal-wage-list-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}`;

  const handleAddNew = () => {
    createWage({
      onSuccess: async (data) => {
        setIsNavigating(true);
        try {
          await prefetch(() => getWageById(data?.id || ''), {
            fetchKey: `personal-wage-${data?.id}`,
          });
        } catch {
          // Fallback to normal navigation if prefetch fails.
        }
        setIsNavigating(false);
        router.push({
          pathname: '/(protected)/wage-detail/[wageId]',
          params: { wageId: data?.id || '' },
        });
      },
      onError: (error) => Alert.alert('Lỗi', generateErrorMessage(error)),
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={require('@/assets/images/add_new.png')}
          iconRenderingMode="original"
          disabled={isCreatingWage}
          accessibilityLabel="Tạo tiền công"
          onPress={handleAddNew}
        />
      </Stack.Toolbar>
      <View style={styles.topContainer}>
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
        <View style={styles.rightContainer}>
          <PressableOpacity
            onPress={() =>
              router.navigate({
                pathname: '/(protected)/personal/(tabs)/calendar',
                params: { calendarMode: 'wage' },
              })
            }
          >
            <Text style={styles.calendarLinkText}>Xem lịch</Text>
          </PressableOpacity>
          <FilterSelect
            placeholder="Trạng thái"
            options={WageStatusOptions}
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
        onChange={handleDateChange}
      />
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <PersonalWageListProvider
          key={suspenseKey}
          selectedDate={selectedDate}
          statusFilter={statusFilter || undefined}
          filterMode={filterMode}
        >
          <PersonalWageListSection
            selectedDate={selectedDate}
            statusFilter={statusFilter || undefined}
            filterMode={filterMode}
          />
        </PersonalWageListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  calendarLinkText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
  },
});
