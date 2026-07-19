import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByProjectId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInProjectContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInProjectContext =
  createContext<ReceiptPaymentListInProjectContextType | null>(null);

export function useReceiptPaymentListInProjectContext() {
  const ctx = useContext(ReceiptPaymentListInProjectContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInProjectContext must be used within ReceiptPaymentListInProjectProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInProjectProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(
    () => getReceiptPaymentsByProjectId(projectId),
    {
      fetchKey: `receipt-payment-list-in-project-${projectId}`,
      tags: [FETCH_TAG.receiptPaymentListInProjectByProjectId(projectId)],
    },
  );

  return (
    <ReceiptPaymentListInProjectContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInProjectContext>
  );
}
