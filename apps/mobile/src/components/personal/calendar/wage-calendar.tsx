import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';

import { COLORS } from '@/constants/style-constants';
import { BusyDaysByMonth } from '@/interfaces/calendar-interfaces';
import {
  WageCalendarProvider,
  useWageCalendarContext,
} from '@/providers/personal/calendar/wage-calendar-provider';
import { calculateComplementDaysInMonth } from '@/utils/calculator/calculate-complement-days-in-month';

import { PersonalCalendarMonthRow } from './personal-calendar-month-row';

interface WageCalendarProps {
  year: number;
  dayMode: 'busy' | 'free';
}

function WageCalendarInner({ dayMode }: Omit<WageCalendarProps, 'year'>) {
  const { year, data, refreshFetch, isRefreshing } = useWageCalendarContext();
  const router = useRouter();

  const busyDaysByMonth: BusyDaysByMonth = data ?? {};
  // Build a 12-element array of dayjs objects representing each month of `year`,
  // ordered from December (i=0 → month 11) down to January (i=11 → month 0).
  //
  // Array.from({ length: 12 }, mapFn) generates elements purely from the index —
  // the first argument is an array-like with no values, so the element param is
  // always undefined and is discarded with `_`.
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
      pathname: '/(protected)/personal/(tabs)/wage',
      params: { day: day.format('YYYY-MM-DD') },
    });
  };

  const handleMonthPress = (month: dayjs.Dayjs) => {
    router.navigate({
      pathname: '/(protected)/personal/(tabs)/wage',
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
        const busyDaysInIsoString = busyDaysByMonth[monthKey] ?? [];
        const days =
          dayMode === 'free'
            ? calculateComplementDaysInMonth(d, busyDaysInIsoString)
            : busyDaysInIsoString.map((s) => dayjs(s));
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

export function WageCalendar({ year, dayMode }: WageCalendarProps) {
  return (
    <WageCalendarProvider year={year}>
      <WageCalendarInner dayMode={dayMode} />
    </WageCalendarProvider>
  );
}
