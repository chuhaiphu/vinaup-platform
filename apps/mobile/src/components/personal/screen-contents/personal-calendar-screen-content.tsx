import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';
import { StyleSheet, View } from 'react-native';

import { EntityListSectionSkeleton } from '@/components/commons/skeletons/entity-list-section-skeleton';
import { PersonalCalendarList } from '@/components/personal/calendar/personal-calendar-list';

export function PersonalCalendarScreenContent() {
  const { calendarMode: calendarModeParam, dayMode: dayModeParam } = useLocalSearchParams<{
    calendarMode?: 'wage' | 'project';
    dayMode?: 'busy' | 'free';
  }>();
  const calendarMode: 'wage' | 'project' = calendarModeParam === 'project' ? 'project' : 'wage';
  const dayMode: 'busy' | 'free' = dayModeParam === 'free' ? 'free' : 'busy';

  const year = dayjs().year();
  const suspenseKey = `personal-calendar-${calendarMode}-${dayMode}-${year}`;

  return (
    <View style={styles.container}>
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
});
