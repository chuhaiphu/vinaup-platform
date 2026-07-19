import type { TourStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getToursByOrganizationId } from '@/apis/tour/tour-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { TourResponse } from '@/interfaces/tour-interfaces';

interface OrganizationTourListContextType {
  tours: TourResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationTourListContext = createContext<OrganizationTourListContextType | null>(null);

export function useOrganizationTourListContext() {
  const ctx = useContext(OrganizationTourListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationTourListContext must be used within OrganizationTourListProvider',
    );
  return ctx;
}

export function OrganizationTourListProvider({
  organizationId,
  selectedDate,
  statusFilter,
  filterMode,
  children,
}: {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter?: TourStatus;
  filterMode: DatePickerMode;
  children: React.ReactNode;
}) {
  // ─── Convert the picked month/day into an overlap range ─────
  // The API filters tours whose [startDate, endDate] overlaps this window, so we
  // send the full month or full day depending on the active picker mode.
  const startDate =
    filterMode === 'month'
      ? selectedDate.startOf('month').toISOString()
      : selectedDate.startOf('day').toISOString();
  const endDate =
    filterMode === 'month'
      ? selectedDate.endOf('month').toISOString()
      : selectedDate.endOf('day').toISOString();
  const dateFormat = filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

  const fetchKey = `organization-tour-list-${organizationId}-${filterMode}-${selectedDate.format(dateFormat)}-${statusFilter}`;

  const {
    data: tours,
    refreshFetch,
    isRefreshing,
  } = useFetch(
    () =>
      getToursByOrganizationId(organizationId, {
        status: statusFilter || undefined,
        startDate,
        endDate,
      }),
    {
      fetchKey,
      tags: [FETCH_TAG.tourList],
    },
  );

  return (
    <OrganizationTourListContext
      value={{
        tours: tours ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationTourListContext>
  );
}
