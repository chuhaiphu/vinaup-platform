import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByBookingId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInBookingContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInBookingContext =
  createContext<ReceiptPaymentListInBookingContextType | null>(null);

export function useReceiptPaymentListInBookingContext() {
  const ctx = useContext(ReceiptPaymentListInBookingContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInBookingContext must be used within ReceiptPaymentListInBookingProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInBookingProvider({
  bookingId,
  children,
}: {
  bookingId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(
    () => getReceiptPaymentsByBookingId(bookingId),
    {
      fetchKey: `receipt-payment-list-in-booking-${bookingId}`,
      tags: [FETCH_TAG.receiptPaymentListInBookingByBookingId(bookingId)],
    },
  );

  return (
    <ReceiptPaymentListInBookingContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInBookingContext>
  );
}
