import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByInvoiceId } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentListInInvoiceContextType {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const ReceiptPaymentListInInvoiceContext =
  createContext<ReceiptPaymentListInInvoiceContextType | null>(null);

export function useReceiptPaymentListInInvoiceContext() {
  const ctx = useContext(ReceiptPaymentListInInvoiceContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentListInInvoiceContext must be used within ReceiptPaymentListInInvoiceProvider',
    );
  return ctx;
}

export function ReceiptPaymentListInInvoiceProvider({
  invoiceId,
  children,
}: {
  invoiceId: string;
  children: React.ReactNode;
}) {
  const { data, refreshFetch, isRefreshing } = useFetch(
    () => getReceiptPaymentsByInvoiceId(invoiceId),
    {
      fetchKey: `receipt-payment-list-in-invoice-${invoiceId}`,
      tags: [FETCH_TAG.receiptPaymentListInInvoiceByInvoiceId(invoiceId)],
    },
  );

  return (
    <ReceiptPaymentListInInvoiceContext
      value={{
        receiptPayments: data ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </ReceiptPaymentListInInvoiceContext>
  );
}
