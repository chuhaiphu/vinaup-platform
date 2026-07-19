import type { ProjectStatus } from '@vinaup-platform/validation';
import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getProjectsOfCurrentUser } from '@/apis/project/project-apis';
import { getReceiptPaymentsByProjectIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface PersonalProjectListContextType {
  projectList: ProjectResponse[];
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const PersonalProjectListContext = createContext<PersonalProjectListContextType | null>(null);

export function usePersonalProjectListContext() {
  const ctx = useContext(PersonalProjectListContext);
  if (!ctx)
    throw new Error(
      'usePersonalProjectListContext must be used within PersonalProjectListProvider',
    );
  return ctx;
}

export function PersonalProjectListProvider({
  selectedDate,
  statusFilter,
  categoryId,
  filterMode,
  children,
}: {
  selectedDate: dayjs.Dayjs;
  statusFilter?: ProjectStatus;
  categoryId?: string;
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
  const fetchKey = `personal-project-list-${filterMode}-${selectedDate.format(dateFormat)}-${statusFilter}-${categoryId ?? ''}`;

  const {
    data: projects,
    refreshFetch,
    isRefreshing,
  } = useFetch(
    () =>
      getProjectsOfCurrentUser({
        status: statusFilter || undefined,
        categoryId: categoryId || undefined,
        startDate,
        endDate,
      }),
    {
      fetchKey,
      tags: [FETCH_TAG.personalProjectList],
    },
  );

  const projectList = projects?.filter((p) => p.organizationId === null) ?? [];
  const projectIds = projectList.map((p) => p.id);
  // Sort with an explicit string comparator so the cache key is deterministic
  const receiptPaymentsFetchKey = `receipt-payment-list-in-projects-${[...projectIds]
    .sort((a, b) => a.localeCompare(b))
    .join(',')}`;

  const { data: allReceiptPayments } = useFetch(() => getReceiptPaymentsByProjectIds(projectIds), {
    fetchKey: receiptPaymentsFetchKey,
    tags: [FETCH_TAG.receiptPaymentListInProjectCollection],
  });

  return (
    <PersonalProjectListContext
      value={{
        projectList,
        receiptPayments: allReceiptPayments ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </PersonalProjectListContext>
  );
}
