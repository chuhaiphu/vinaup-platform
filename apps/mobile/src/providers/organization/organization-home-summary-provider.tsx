import dayjs from 'dayjs';
import { useFetchFn } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getInvoicesByOrganizationId } from '@/apis/invoice/invoice-apis';
import { getReceiptPaymentsByInvoiceIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { INVOICE_TYPE } from '@/constants/invoice-constants';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface OrganizationHomeSummaryContextType {
  invoices: InvoiceResponse[] | null | undefined;
  receiptPayments: ReceiptPaymentResponse[] | null | undefined;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
}

const OrganizationHomeSummaryContext = createContext<OrganizationHomeSummaryContextType | null>(
  null,
);

export function useOrganizationHomeSummaryContext() {
  const ctx = useContext(OrganizationHomeSummaryContext);
  if (!ctx)
    throw new Error(
      'useOrganizationHomeSummaryContext must be used within OrganizationHomeSummaryProvider',
    );
  return ctx;
}

export function OrganizationHomeSummaryProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  const today = dayjs();
  const todayKey = today.format('YYYY-MM-DD');

  const {
    data: invoices,
    executeFetchFn: fetchInvoices,
    refreshFetchFn: refreshInvoices,
  } = useFetchFn(
    () =>
      getInvoicesByOrganizationId(organizationId, {
        type: INVOICE_TYPE.SELL,
        startDate: today.startOf('day').toISOString(),
        endDate: today.endOf('day').toISOString(),
      }),
    {
      fetchKey: `organization-invoice-list-${organizationId}-${todayKey}`,
      tags: [FETCH_TAG.invoiceList],
    },
  );

  const {
    data: receiptPayments,
    executeFetchFn: fetchReceiptPaymentsByInvoiceIds,
    isRefreshing,
    refreshFetchFn: refreshReceiptPaymentsByInvoiceIds,
  } = useFetchFn(
    () =>
      getReceiptPaymentsByInvoiceIds(
        (invoices?.filter((i) => i.type === INVOICE_TYPE.SELL) || []).map((i) => i.id),
      ),
    {
      fetchKey: `receipt-payment-list-in-invoice-${organizationId}-${todayKey}`,
      tags: [FETCH_TAG.receiptPaymentListInInvoiceCollection],
    },
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    if (!invoices || invoices.length === 0) return;
    fetchReceiptPaymentsByInvoiceIds();
  }, [fetchReceiptPaymentsByInvoiceIds, organizationId, invoices]);

  const refreshAll = async () => {
    await Promise.all([refreshInvoices(), refreshReceiptPaymentsByInvoiceIds()]);
  };

  return (
    <OrganizationHomeSummaryContext
      value={{
        invoices,
        receiptPayments,
        isRefreshing: isRefreshing ?? false,
        refreshAll,
      }}
    >
      {children}
    </OrganizationHomeSummaryContext>
  );
}
