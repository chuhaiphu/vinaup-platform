import dayjs from 'dayjs';
import { useFetch } from 'fetchwire';
import { createContext, useContext } from 'react';

import { getProjectsOfByOrganizationId } from '@/apis/project/project-apis';
import { getReceiptPaymentsByProjectIds } from '@/apis/receipt-payment/receipt-payment-apis';
import { type DatePickerMode } from '@/constants/date-constants';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ProjectResponse } from '@/interfaces/project-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface OrganizationProjectListContextType {
  projects: ProjectResponse[];
  allReceiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  refreshFetch: () => void;
}

const OrganizationProjectListContext = createContext<OrganizationProjectListContextType | null>(
  null,
);

export function useOrganizationProjectListContext() {
  const ctx = useContext(OrganizationProjectListContext);
  if (!ctx)
    throw new Error(
      'useOrganizationProjectListContext must be used within OrganizationProjectListProvider',
    );
  return ctx;
}

export function OrganizationProjectListProvider({
  organizationId,
  selectedDate,
  statusFilter,
  filterMode,
  children,
}: {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter: string;
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

  const fetchKey = `organization-project-list-${organizationId}-${filterMode}-${selectedDate.format(dateFormat)}-${statusFilter}`;

  const fetchFn = async () => {
    const projectsRes = await getProjectsOfByOrganizationId(organizationId, {
      status: statusFilter || undefined,
      startDate,
      endDate,
    });

    const projects: ProjectResponse[] = projectsRes.data ?? [];
    const projectIds = projects.map((p) => p.id);

    const allReceiptPayments: ReceiptPaymentResponse[] =
      projectIds.length > 0 ? ((await getReceiptPaymentsByProjectIds(projectIds)).data ?? []) : [];

    return { projects, allReceiptPayments };
  };

  const { data, refreshFetch, isRefreshing } = useFetch<{
    projects: ProjectResponse[];
    allReceiptPayments: ReceiptPaymentResponse[];
  }>(fetchFn, {
    fetchKey,
    tags: [FETCH_TAG.projectList, FETCH_TAG.receiptPaymentListInProjectCollection],
  });

  return (
    <OrganizationProjectListContext
      value={{
        projects: data?.projects ?? [],
        allReceiptPayments: data?.allReceiptPayments ?? [],
        isRefreshing,
        refreshFetch,
      }}
    >
      {children}
    </OrganizationProjectListContext>
  );
}
