import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getProjectBusyDays } from '@/apis/project/project-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { BusyDaysByMonth } from '@/interfaces/calendar-interfaces';

interface ProjectCalendarContextType {
  year: number;
  data: BusyDaysByMonth | null | undefined;
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ProjectCalendarContext = createContext<ProjectCalendarContextType | null>(null);

export function useProjectCalendarContext() {
  const ctx = useContext(ProjectCalendarContext);
  if (!ctx)
    throw new Error('useProjectCalendarContext must be used within ProjectCalendarProvider');
  return ctx;
}

export function ProjectCalendarProvider({
  year,
  children,
}: {
  year: number;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(() => getProjectBusyDays({ year }), {
    fetchKey: `personal-calendar-project-${year}`,
    tags: [FETCH_TAG.personalCalendarProject],
  });

  return (
    <ProjectCalendarContext
      value={{ year, data, isRefreshing: isRefreshing ?? false, refreshFetch }}
    >
      {children}
    </ProjectCalendarContext>
  );
}
