import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getWageBusyDays } from '@/apis/wage/wage-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { BusyDaysByMonth } from '@/interfaces/calendar-interfaces';

interface WageCalendarContextType {
  year: number;
  data: BusyDaysByMonth | null | undefined;
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const WageCalendarContext = createContext<WageCalendarContextType | null>(null);

export function useWageCalendarContext() {
  const ctx = useContext(WageCalendarContext);
  if (!ctx) throw new Error('useWageCalendarContext must be used within WageCalendarProvider');
  return ctx;
}

export function WageCalendarProvider({
  year,
  children,
}: {
  year: number;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(() => getWageBusyDays({ year }), {
    fetchKey: `personal-calendar-wage-${year}`,
    tags: [FETCH_TAG.personalCalendarWage],
  });

  return (
    <WageCalendarContext value={{ year, data, isRefreshing: isRefreshing ?? false, refreshFetch }}>
      {children}
    </WageCalendarContext>
  );
}
