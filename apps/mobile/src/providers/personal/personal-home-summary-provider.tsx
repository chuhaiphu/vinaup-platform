import dayjs from 'dayjs';
import { useFetchFn } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getProjectsOfCurrentUser } from '@/apis/project/project-apis';
import { getReceiptPaymentsByWageIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { getWagesOfCurrentUser } from '@/apis/wage/wage-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { WageResponse } from '@/interfaces/wage-interfaces';

interface PersonalHomeSummaryContextType {
  projects: ProjectResponse[] | null | undefined;
  wages: WageResponse[] | null | undefined;
  receiptPaymentsInWages: ReceiptPaymentResponse[] | null | undefined;
  isRefreshingProjects: boolean;
  isRefreshingWages: boolean;
  isRefreshingReceiptPayments: boolean;
  refreshAll: () => Promise<void>;
}

const PersonalHomeSummaryContext = createContext<PersonalHomeSummaryContextType | null>(null);

export function usePersonalHomeSummaryContext() {
  const ctx = useContext(PersonalHomeSummaryContext);
  if (!ctx)
    throw new Error(
      'usePersonalHomeSummaryContext must be used within PersonalHomeSummaryProvider',
    );
  return ctx;
}

export function PersonalHomeSummaryProvider({ children }: { children: React.ReactNode }) {
  const thisMonth = dayjs();
  const thisMonthKey = thisMonth.format('YYYY-MM');

  const {
    data: projects,
    executeFetchFn: fetchProjects,
    isRefreshing: isRefreshingProjects,
    refreshFetchFn: refreshProjects,
  } = useFetchFn(
    () =>
      getProjectsOfCurrentUser({
        startDate: thisMonth.startOf('month').toISOString(),
        endDate: thisMonth.endOf('month').toISOString(),
      }),
    {
      fetchKey: `personal-project-list-${thisMonthKey}`,
      tags: [FETCH_TAG.personalProjectList],
    },
  );

  const {
    data: wages,
    executeFetchFn: fetchWages,
    isRefreshing: isRefreshingWages,
    refreshFetchFn: refreshWages,
  } = useFetchFn(
    () =>
      getWagesOfCurrentUser({
        startDate: thisMonth.startOf('month').toISOString(),
        endDate: thisMonth.endOf('month').toISOString(),
      }),
    {
      fetchKey: `personal-wage-list-${thisMonthKey}`,
      tags: [FETCH_TAG.personalWageList],
    },
  );

  const {
    data: receiptPaymentsInWages,
    executeFetchFn: fetchReceiptPaymentsByWageIds,
    isRefreshing: isRefreshingReceiptPayments,
    refreshFetchFn: refreshReceiptPaymentsByWageIds,
  } = useFetchFn(() => getReceiptPaymentsByWageIds((wages || []).map((w) => w.id)), {
    fetchKey: `receipt-payment-list-in-wage-${thisMonthKey}`,
    tags: [FETCH_TAG.receiptPaymentListInWageCollection],
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchWages();
  }, [fetchWages]);

  useEffect(() => {
    if (!wages || wages.length === 0) return;
    fetchReceiptPaymentsByWageIds();
  }, [fetchReceiptPaymentsByWageIds, wages]);

  const refreshAll = async () => {
    await Promise.all([refreshProjects(), refreshWages(), refreshReceiptPaymentsByWageIds()]);
  };

  return (
    <PersonalHomeSummaryContext
      value={{
        projects,
        wages,
        receiptPaymentsInWages,
        isRefreshingProjects: isRefreshingProjects ?? false,
        isRefreshingWages: isRefreshingWages ?? false,
        isRefreshingReceiptPayments: isRefreshingReceiptPayments ?? false,
        refreshAll,
      }}
    >
      {children}
    </PersonalHomeSummaryContext>
  );
}
