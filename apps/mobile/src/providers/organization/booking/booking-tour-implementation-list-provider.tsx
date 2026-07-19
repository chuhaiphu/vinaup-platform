import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getBookingsByTourImplementationId } from '@/apis/booking/booking-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { BookingResponse } from '@/interfaces/booking-interfaces';

interface BookingTourImplementationListContextType {
  bookings: BookingResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const BookingTourImplementationListContext =
  createContext<BookingTourImplementationListContextType | null>(null);

export function useBookingTourImplementationListContext() {
  const ctx = useContext(BookingTourImplementationListContext);
  if (!ctx)
    throw new Error(
      'useBookingTourImplementationListContext must be used within BookingTourImplementationListProvider',
    );
  return ctx;
}

export function BookingTourImplementationListProvider({
  tourImplementationId,
  selectedDate,
  statusFilter,
  children,
}: {
  tourImplementationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter?: string;
  children: React.ReactNode;
}) {
  const filter = {
    status: statusFilter || undefined,
    startDate: selectedDate.startOf('month').toISOString(),
    endDate: selectedDate.endOf('month').toISOString(),
  };

  const {
    data: bookings,
    refreshFetch,
    isRefreshing,
  } = useFetch(() => getBookingsByTourImplementationId(tourImplementationId, filter), {
    fetchKey: `organization-booking-list-in-tour-implementation-${tourImplementationId}-${selectedDate.format('YYYY-MM')}`,
    tags: [FETCH_TAG.bookingListInTourImplementationByTourImplementationId(tourImplementationId)],
  });

  return (
    <BookingTourImplementationListContext
      value={{
        bookings: bookings ?? [],
        isRefreshing: isRefreshing ?? false,
        refreshFetch,
      }}
    >
      {children}
    </BookingTourImplementationListContext>
  );
}
