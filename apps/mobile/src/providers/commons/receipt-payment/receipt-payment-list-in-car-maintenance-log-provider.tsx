import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByCarMaintenanceLogId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInCarMaintenanceLogContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInCarMaintenanceLogContext =
  createContext<ReceiptPaymentListInCarMaintenanceLogContextType | null>(null);

export function useReceiptPaymentListInCarMaintenanceLogContext() {
  const ctx = useContext(ReceiptPaymentListInCarMaintenanceLogContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInCarMaintenanceLogContext must be used within ReceiptPaymentListInCarMaintenanceLogProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInCarMaintenanceLogProvider({
  carMaintenanceLogId,
  children,
}: {
  carMaintenanceLogId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(
    () => getReceiptPaymentsByCarMaintenanceLogId(carMaintenanceLogId),
    {
      fetchKey: `receipt-payment-list-in-car-maintenance-log-${carMaintenanceLogId}`,
      tags: [
        FETCH_TAG.receiptPaymentListInCarMaintenanceLogByCarMaintenanceLogId(carMaintenanceLogId),
      ],
    },
  );

  return (
    <ReceiptPaymentListInCarMaintenanceLogContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInCarMaintenanceLogContext>
  );
}
