import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getCarsByOrganizationId } from '@/apis/car/car-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { CarResponse } from '@/interfaces/car-interfaces';

interface OrganizationCarListContextType {
  cars: CarResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationCarListContext = createContext<OrganizationCarListContextType | null>(null);

export function useOrganizationCarListContext() {
  const ctx = useContext(OrganizationCarListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationCarListContext must be used within OrganizationCarListProvider',
    );
  return ctx;
}

export function OrganizationCarListProvider({
  organizationId,
  selectedDate,
  filterMode = 'month',
  children,
}: {
  organizationId: string;
  selectedDate?: dayjs.Dayjs;
  filterMode?: DatePickerMode;
  children: React.ReactNode;
}) {
  // ─── Convert the picked month/day into an overlap range ─────
  const dateFilter = selectedDate
    ? {
        startDate:
          filterMode === 'month'
            ? selectedDate.startOf('month').toISOString()
            : selectedDate.startOf('day').toISOString(),
        endDate:
          filterMode === 'month'
            ? selectedDate.endOf('month').toISOString()
            : selectedDate.endOf('day').toISOString(),
      }
    : undefined;

  const dateFormat = filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

  const fetchKey = selectedDate
    ? `organization-car-list-${organizationId}-${filterMode}-${selectedDate.format(dateFormat)}`
    : `organization-car-list-${organizationId}`;

  const {
    data: cars,
    refreshFetch,
    isRefreshing,
  } = useFetch(() => getCarsByOrganizationId(organizationId, dateFilter), {
    fetchKey,
    tags: [FETCH_TAG.carList],
  });

  return (
    <OrganizationCarListContext
      value={{
        cars: cars ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationCarListContext>
  );
}
