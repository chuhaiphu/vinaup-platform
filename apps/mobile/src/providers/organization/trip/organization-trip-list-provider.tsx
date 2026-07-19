import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getTripsByOrganizationId } from '@/apis/trip/trip-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { TripResponse } from '@/interfaces/trip-interfaces';

interface OrganizationTripListContextType {
  trips: TripResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationTripListContext = createContext<OrganizationTripListContextType | null>(null);

export function useOrganizationTripListContext() {
  const ctx = useContext(OrganizationTripListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationTripListContext must be used within OrganizationTripListProvider',
    );
  return ctx;
}

export function OrganizationTripListProvider({
  organizationId,
  selectedDate,
  filterMode,
  children,
}: {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  filterMode: DatePickerMode;
  children: React.ReactNode;
}) {
  // ─── Convert the picked month/day into an overlap range ─────
  const startDate =
    filterMode === 'month'
      ? selectedDate.startOf('month').toISOString()
      : selectedDate.startOf('day').toISOString();
  const endDate =
    filterMode === 'month'
      ? selectedDate.endOf('month').toISOString()
      : selectedDate.endOf('day').toISOString();
  const dateFormat = filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

  const fetchKey = `organization-trip-list-${organizationId}-${filterMode}-${selectedDate.format(dateFormat)}`;

  const {
    data: trips,
    refreshFetch,
    isRefreshing,
  } = useFetch(() => getTripsByOrganizationId(organizationId, { startDate, endDate }), {
    fetchKey,
    tags: [FETCH_TAG.tripList],
  });

  return (
    <OrganizationTripListContext
      value={{
        trips: trips ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationTripListContext>
  );
}
