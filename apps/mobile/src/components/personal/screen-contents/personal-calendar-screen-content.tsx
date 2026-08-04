import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { PersonalCalendarList } from '@/components/personal/calendar/personal-calendar-list';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { TextToggler } from '@/components/primitives/text-toggler';
import { COLORS, FONT_SIZES, ICON_SIZES, SPACING } from '@/constants/style-constants';

type DayMode = 'busy' | 'free';

const DAY_MODE_ITEMS: SegmentedControlItem<DayMode>[] = [
  { value: 'busy', label: 'Lịch bận' },
  { value: 'free', label: 'Lịch rảnh' },
];

export function PersonalCalendarScreenContent() {
  const router = useRouter();
  const { calendarMode: calendarModeParam, dayMode: dayModeParam } = useLocalSearchParams<{
    calendarMode?: 'wage' | 'project';
    dayMode?: DayMode;
  }>();
  const calendarMode: 'wage' | 'project' = calendarModeParam === 'project' ? 'project' : 'wage';
  const dayMode: DayMode = dayModeParam === 'free' ? 'free' : 'busy';

  const [localDayMode, setLocalDayMode] = useState<DayMode>(dayMode);

  const year = dayjs().year();
  const suspenseKey = `personal-calendar-${calendarMode}-${dayMode}-${year}`;

  const handleToggleMode = () => {
    router.setParams({ calendarMode: calendarMode === 'wage' ? 'project' : 'wage' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <TextToggler
          textPair={['tiền công', 'dự án']}
          currentIndex={calendarMode === 'wage' ? 0 : 1}
          onToggle={handleToggleMode}
          style={{ text: styles.togglerText }}
          rightSection={
            <FontAwesome6
              iconStyle="solid"
              name="caret-down"
              size={ICON_SIZES.md}
              color={COLORS.teal700}
            />
          }
        />
        <SegmentedControl
          items={DAY_MODE_ITEMS}
          value={localDayMode}
          onChange={setLocalDayMode}
          onSettled={(value) => router.setParams({ dayMode: value })}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
            label: { fontSize: FONT_SIZES.base },
          }}
        />
      </View>
      <Suspense fallback={<EntityListSectionSkeleton />}>
        <PersonalCalendarList
          key={suspenseKey}
          calendarMode={calendarMode}
          dayMode={dayMode}
          year={year}
        />
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
    gap: SPACING.sm,
  },
  togglerText: {
    fontSize: FONT_SIZES.lg,
  },
});
