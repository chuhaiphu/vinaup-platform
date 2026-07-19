import type { WageStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getReceiptPaymentsByWageIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { getWagesOfCurrentUser } from '@/apis/wage/wage-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { WageResponse } from '@/interfaces/wage-interfaces';

interface PersonalWageListContextType {
  wageList: WageResponse[];
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const PersonalWageListContext = createContext<PersonalWageListContextType | null>(null);

export function usePersonalWageListContext() {
  const ctx = useContext(PersonalWageListContext);
  if (!ctx)
    throw new Error('usePersonalWageListContext must be used within PersonalWageListProvider');
  return ctx;
}

export function PersonalWageListProvider({
  selectedDate,
  statusFilter,
  filterMode,
  children,
}: {
  selectedDate: dayjs.Dayjs;
  statusFilter?: WageStatus;
  filterMode: DatePickerMode;
  children: React.ReactNode;
}) {
  const startDate =
    filterMode === 'month'
      ? selectedDate.startOf('month').toISOString()
      : selectedDate.startOf('day').toISOString();
  const endDate =
    filterMode === 'month'
      ? selectedDate.endOf('month').toISOString()
      : selectedDate.endOf('day').toISOString();
  const dateFormat = filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD';
  const fetchKey = `personal-wage-list-${filterMode}-${selectedDate.format(dateFormat)}-${statusFilter}`;

  const {
    data: wages,
    refreshFetch,
    isRefreshing,
  } = useFetch(
    () =>
      getWagesOfCurrentUser({
        status: statusFilter || undefined,
        startDate,
        endDate,
      }),
    {
      fetchKey,
      tags: [FETCH_TAG.personalWageList],
    },
  );

  const wageList = wages ?? [];
  const wageIds = wageList.map((w) => w.id);
  // Sort with an explicit string comparator so the cache key is deterministic
  const receiptPaymentsFetchKey = `receipt-payment-list-in-wages-${[...wageIds]
    .sort((a, b) => a.localeCompare(b))
    .join(',')}`;

  const { data: allReceiptPayments } = useFetch(() => getReceiptPaymentsByWageIds(wageIds), {
    fetchKey: receiptPaymentsFetchKey,
    tags: [FETCH_TAG.receiptPaymentListInWageCollection],
  });

  return (
    <PersonalWageListContext
      value={{
        wageList,
        receiptPayments: allReceiptPayments ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </PersonalWageListContext>
  );
}
