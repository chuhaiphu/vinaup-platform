import type { BookingStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';

import {
  getBookingsByOrganizationId,
  getBookingsByOrganizationCustomerOrganizationId,
} from '@/apis/booking/booking-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { BookingResponse } from '@/interfaces/booking-interfaces';

export type BookingWithRole = { booking: BookingResponse; isReceiver: boolean };

interface OrganizationBookingListContextType {
  combinedBookings: BookingWithRole[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationBookingListContext = createContext<OrganizationBookingListContextType | null>(
  null,
);

export function useOrganizationBookingListContext() {
  const ctx = useContext(OrganizationBookingListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationBookingListContext must be used within OrganizationBookingListProvider',
    );
  return ctx;
}

export function OrganizationBookingListProvider({
  organizationId,
  selectedDate,
  statusFilter,
  children,
}: {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter?: BookingStatus;
  children: React.ReactNode;
}) {
  const filter = {
    status: statusFilter || undefined,
    startDate: selectedDate.startOf('month').toISOString(),
    endDate: selectedDate.endOf('month').toISOString(),
  };

  const senderKey = `organization-booking-sender-list-${organizationId}-${selectedDate.format('YYYY-MM')}-${statusFilter}`;
  const receiverKey = `organization-booking-receiver-list-${organizationId}-${selectedDate.format('YYYY-MM')}-${statusFilter}`;

  const {
    data: senderBookings,
    refreshFetch: refreshSender,
    isRefreshing: isSenderRefreshing,
  } = useFetch(() => getBookingsByOrganizationId(organizationId, filter), {
    fetchKey: senderKey,
    tags: [FETCH_TAG.bookingList],
  });

  const {
    data: receiverBookings,
    refreshFetch: refreshReceiver,
    isRefreshing: isReceiverRefreshing,
  } = useFetch(() => getBookingsByOrganizationCustomerOrganizationId(organizationId, filter), {
    fetchKey: receiverKey,
    tags: [FETCH_TAG.bookingList],
  });

  const combinedBookings: BookingWithRole[] = [
    ...(senderBookings ?? []).map((b) => ({ booking: b, isReceiver: false })),
    ...(receiverBookings ?? []).map((b) => ({ booking: b, isReceiver: true })),
  ].sort((a, b) => dayjs(b.booking.startDate).valueOf() - dayjs(a.booking.startDate).valueOf());

  const refreshFetch = useCallback(() => {
    refreshSender();
    refreshReceiver();
  }, [refreshSender, refreshReceiver]);

  return (
    <OrganizationBookingListContext
      value={{
        combinedBookings,
        isRefreshing: isSenderRefreshing || isReceiverRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationBookingListContext>
  );
}
