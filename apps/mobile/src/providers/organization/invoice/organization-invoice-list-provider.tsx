import type { InvoiceStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getInvoicesByOrganizationId } from '@/apis/invoice/invoice-apis';
import { getReceiptPaymentsByInvoiceIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

import { useInvoiceTypeContext } from './invoice-type-provider';

interface OrganizationInvoiceListContextType {
  invoices: InvoiceResponse[];
  allReceiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationInvoiceListContext = createContext<OrganizationInvoiceListContextType | null>(
  null,
);

export function useOrganizationInvoiceListContext() {
  const ctx = useContext(OrganizationInvoiceListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationInvoiceListContext must be used within OrganizationInvoiceListProvider',
    );
  return ctx;
}

export function OrganizationInvoiceListProvider({
  organizationId,
  selectedDate,
  statusFilter,
  invoiceTypeCode,
  filterMode,
  children,
}: {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter?: InvoiceStatus;
  invoiceTypeCode: string;
  filterMode: DatePickerMode;
  children: React.ReactNode;
}) {
  const { getInvoiceTypeByCode } = useInvoiceTypeContext();

  const startDate =
    filterMode === 'month'
      ? selectedDate.startOf('month').toISOString()
      : selectedDate.startOf('day').toISOString();
  const endDate =
    filterMode === 'month'
      ? selectedDate.endOf('month').toISOString()
      : selectedDate.endOf('day').toISOString();
  const dateFormat = filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';

  const fetchKey = `organization-invoice-list-${organizationId}-${invoiceTypeCode}-${filterMode}-${selectedDate.format(dateFormat)}-${statusFilter}`;

  const fetchFn = async () => {
    const invoiceType = getInvoiceTypeByCode(invoiceTypeCode);
    const invoicesRes = await getInvoicesByOrganizationId(organizationId, {
      invoiceTypeId: invoiceType?.id,
      status: statusFilter || undefined,
      startDate,
      endDate,
    });

    const invoices: InvoiceResponse[] = invoicesRes.data ?? [];
    const invoiceIds = invoices.map((inv) => inv.id);

    const allReceiptPayments: ReceiptPaymentResponse[] =
      invoiceIds.length > 0 ? ((await getReceiptPaymentsByInvoiceIds(invoiceIds)).data ?? []) : [];

    return { invoices, allReceiptPayments };
  };

  const { data, refreshFetch, isRefreshing } = useFetch<{
    invoices: InvoiceResponse[];
    allReceiptPayments: ReceiptPaymentResponse[];
  }>(fetchFn, {
    fetchKey,
    tags: [FETCH_TAG.invoiceList, FETCH_TAG.receiptPaymentListInInvoiceCollection],
  });

  return (
    <OrganizationInvoiceListContext
      value={{
        invoices: data?.invoices ?? [],
        allReceiptPayments: data?.allReceiptPayments ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationInvoiceListContext>
  );
}
