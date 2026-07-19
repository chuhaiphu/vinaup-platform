import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { PersonalProjectListSection } from '@/components/personal/project/list/personal-project-list-section';
import { FilterSelect } from '@/components/primitives/filter-select';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { UnifiedDatePicker } from '@/components/primitives/unified-date-picker';
import { DD_MM_YYYY_DATE_FORMAT, MM_YYYY_DATE_FORMAT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { ProjectStatusOptions } from '@/constants/project-constants';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { PersonalProjectListProvider } from '@/providers/personal/project/personal-project-list-provider';

export function PersonalProjectScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; month?: string; day?: string }>();
  const categoryId = params.categoryId || '';
  const { month, day } = params;

  const [statusFilter, setStatusFilter] = useState('');
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

  const suspenseKey = `personal-project-list-${filterMode}-${
    filterMode === 'month' ? selectedDate.format('YYYY-MM') : selectedDate.format('YYYY-MM-DD')
  }-${statusFilter}-${categoryId}`;

  return (
    <View style={styles.container}>
      <View style={styles.projectTopContainer}>
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
          options={ProjectStatusOptions}
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
        <PersonalProjectListProvider
          key={suspenseKey}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          categoryId={categoryId}
          filterMode={filterMode}
        >
          <PersonalProjectListSection
            selectedDate={selectedDate}
            statusFilter={statusFilter}
            categoryId={categoryId}
            filterMode={filterMode}
          />
        </PersonalProjectListProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  projectTopContainer: {
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
