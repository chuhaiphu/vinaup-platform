import { useFetch } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';

import { getInvoiceTypes } from '@/apis/invoice/invoice-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { InvoiceTypeResponse } from '@/interfaces/invoice-type-interfaces';

interface InvoiceTypeContextType {
  invoiceTypes: InvoiceTypeResponse[];
  isRefreshingInvoiceTypes: boolean;
  refreshInvoiceTypes: () => void;
  getInvoiceTypeByCode: (code: string) => InvoiceTypeResponse | undefined;
  getInvoiceTypeById: (id: string) => InvoiceTypeResponse | undefined;
}

const InvoiceTypeContext = createContext<InvoiceTypeContextType | null>(null);

export function useInvoiceTypeContext() {
  const ctx = useContext(InvoiceTypeContext);
  if (!ctx) throw new Error('useInvoiceTypeContext must be used within InvoiceTypeProvider');
  return ctx;
}

export function InvoiceTypeProvider({ children }: { children: React.ReactNode }) {
  const {
    data: invoiceTypes,
    isRefreshing: isRefreshingInvoiceTypes,
    refreshFetch: refreshInvoiceTypes,
  } = useFetch(() => getInvoiceTypes(), {
    fetchKey: 'invoice-types',
    tags: [FETCH_TAG.invoiceTypeList],
  });

  const getInvoiceTypeByCode = useCallback(
    (code: string) => invoiceTypes?.find((t) => t.code === code),
    [invoiceTypes],
  );

  const getInvoiceTypeById = useCallback(
    (id: string) => invoiceTypes?.find((t) => t.id === id),
    [invoiceTypes],
  );

  return (
    <InvoiceTypeContext
      value={{
        invoiceTypes: invoiceTypes ?? [],
        isRefreshingInvoiceTypes,
        refreshInvoiceTypes,
        getInvoiceTypeByCode,
        getInvoiceTypeById,
      }}
    >
      {children}
    </InvoiceTypeContext>
  );
}
