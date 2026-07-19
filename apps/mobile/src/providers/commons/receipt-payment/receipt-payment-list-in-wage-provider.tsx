import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByWageId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInWageContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInWageContext = createContext<ReceiptPaymentListInWageContextType | null>(
  null,
);

export function useReceiptPaymentListInWageContext() {
  const ctx = useContext(ReceiptPaymentListInWageContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInWageContext must be used within ReceiptPaymentListInWageProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInWageProvider({
  wageId,
  children,
}: {
  wageId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(() => getReceiptPaymentsByWageId(wageId), {
    fetchKey: `receipt-payment-list-in-wage-${wageId}`,
    tags: [FETCH_TAG.receiptPaymentListInWageByWageId(wageId)],
  });

  return (
    <ReceiptPaymentListInWageContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInWageContext>
  );
}
