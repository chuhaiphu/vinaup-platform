import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByTripId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInTripContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInTripContext = createContext<ReceiptPaymentListInTripContextType | null>(
  null,
);

export function useReceiptPaymentListInTripContext() {
  const ctx = useContext(ReceiptPaymentListInTripContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInTripContext must be used within ReceiptPaymentListInTripProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInTripProvider({
  tripId,
  children,
}: {
  tripId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(() => getReceiptPaymentsByTripId(tripId), {
    fetchKey: `receipt-payment-list-in-trip-${tripId}`,
    tags: [FETCH_TAG.receiptPaymentListInTripByTripId(tripId)],
  });

  return (
    <ReceiptPaymentListInTripContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInTripContext>
  );
}
