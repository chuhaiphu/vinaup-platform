import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { COLORS } from '@/constants/style-constants';
import { BusyDaysByMonth } from '@/interfaces/calendar-interfaces';
import {
  ProjectCalendarProvider,
  useProjectCalendarContext,
} from '@/providers/personal/calendar/project-calendar-provider';
import { calculateComplementDaysInMonth } from '@/utils/calculator/calculate-complement-days-in-month';

import { PersonalCalendarMonthRow } from './personal-calendar-month-row';

interface ProjectCalendarProps {
  year: number;
  dayMode: 'busy' | 'free';
}

function ProjectCalendarInner({ dayMode }: Omit<ProjectCalendarProps, 'year'>) {
  const { year, data, refreshFetch, isRefreshing } = useProjectCalendarContext();
  const router = useRouter();

  const busyDaysByMonth: BusyDaysByMonth = data ?? {};
  // Build a 12-element array of dayjs objects representing each month of `year`,
  // ordered from December (i=0 → month 11) down to January (i=11 → month 0).
  //
  // Why `.startOf('month')`: dayjs() captures today's date, including the current
  // day-of-month. Calling .year().month() on it only changes those fields while
  // the day stays as-is. If today is the 31st and the target month has fewer days
  // (e.g. February), JavaScript Date overflows into the next month, making
  // d.format('YYYY-MM') return the wrong month key. `.startOf('month')` resets
  // the day to 1, which is valid in every month and eliminates the overflow.
  const monthsArrayDesc = Array.from({ length: 12 }, (_, i) =>
    dayjs()
      .year(year)
      .month(11 - i)
      .startOf('month'),
  );

  const handleDayPress = (day: dayjs.Dayjs) => {
    router.navigate({
      pathname: '/(protected)/personal/(tabs)/project',
      params: { day: day.format('YYYY-MM-DD') },
    });
  };

  const handleMonthPress = (month: dayjs.Dayjs) => {
    router.navigate({
      pathname: '/(protected)/personal/(tabs)/project',
      params: { month: month.format('YYYY-MM') },
    });
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshFetch}
          colors={[COLORS.teal700]}
        />
      }
    >
      {monthsArrayDesc.map((d) => {
        const monthKey = d.format('YYYY-MM');
        const busyIsoStrings = busyDaysByMonth[monthKey] ?? [];
        const days =
          dayMode === 'free'
            ? calculateComplementDaysInMonth(d, busyIsoStrings)
            : busyIsoStrings.map((s) => dayjs(s));
        return (
          <PersonalCalendarMonthRow
            key={monthKey}
            monthStart={d}
            days={days}
            onDayPress={dayMode === 'busy' ? handleDayPress : undefined}
            onMonthPress={dayMode === 'busy' ? handleMonthPress : undefined}
          />
        );
      })}
    </ScrollView>
  );
}

export function ProjectCalendar({ year, dayMode }: ProjectCalendarProps) {
  return (
    <ProjectCalendarProvider year={year}>
      <ProjectCalendarInner dayMode={dayMode} />
    </ProjectCalendarProvider>
  );
}
