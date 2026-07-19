import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByTourImplementationId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInTourImplementationContextType {
  allReceiptPayments: ReceiptPaymentResponse[];
  tourGuideReceiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshReceiptPayments: () => void;
}

const ReceiptPaymentListInTourImplementationContext =
  createContext<ReceiptPaymentListInTourImplementationContextType | null>(null);

export function useReceiptPaymentListInTourImplementationContext() {
  const ctx = useContext(ReceiptPaymentListInTourImplementationContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInTourImplementationContext must be used within ReceiptPaymentListInTourImplementationProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInTourImplementationProvider({
  tourImplementationId,
  children,
}: {
  tourImplementationId: string;
  children: React.ReactNode;
}) {
  const {
    data: allReceiptPayments,
    refreshFetch: refreshReceiptPayments,
    isRefreshing,
  } = useFetch(() => getReceiptPaymentsByTourImplementationId(tourImplementationId), {
    fetchKey: `receipt-payment-list-in-tour-implementation-${tourImplementationId}`,
    tags: [
      FETCH_TAG.receiptPaymentListInTourImplementationByTourImplementationId(tourImplementationId),
    ],
  });

  const tourGuideReceiptPayments = (allReceiptPayments ?? []).filter((rp) =>
    rp.tourImplementationReceiptPayments?.some(
      (j) => j.tourImplementationId === tourImplementationId && j.groupCode === 'FOR_TOUR_GUIDE',
    ),
  );

  return (
    <ReceiptPaymentListInTourImplementationContext
      value={{
        allReceiptPayments: allReceiptPayments ?? [],
        tourGuideReceiptPayments,
        isRefreshing: isRefreshing ?? false,
        refreshReceiptPayments,
      }}
    >
      {children}
    </ReceiptPaymentListInTourImplementationContext>
  );
}
