import { useFetchFn } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getOrganizationById } from '@/apis/organization/organization-apis';
import { getTourSettlementCancelLogById } from '@/apis/tour/tour-settlement-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';
import { TourSettlementCancelLogResponse } from '@/interfaces/tour-settlement-interfaces';

interface TourSettlementCancelLogDetailContextType {
  cancelLog: TourSettlementCancelLogResponse | null | undefined;
  organization: OrganizationResponse | null | undefined;
  isLoading: boolean;
  fetchCancelLog: () => void;
}

const TourSettlementCancelLogDetailContext =
  createContext<TourSettlementCancelLogDetailContextType | null>(null);

export function useTourSettlementCancelLogDetailContext() {
  const ctx = useContext(TourSettlementCancelLogDetailContext);
  if (!ctx)
    throw new Error(
      'useTourSettlementCancelLogDetailContext must be used within TourSettlementCancelLogDetailProvider',
    );
  return ctx;
}

export function TourSettlementCancelLogDetailProvider({
  cancelLogId,
  organizationId,
  children,
}: {
  cancelLogId: string;
  organizationId?: string;
  children: React.ReactNode;
}) {
  const {
    data: cancelLog,
    isLoading,
    executeFetchFn: fetchCancelLog,
  } = useFetchFn(() => getTourSettlementCancelLogById(cancelLogId), {
    fetchKey: `tour-settlement-cancel-log-${cancelLogId}`,
    tags: [FETCH_TAG.tourSettlementCancelLogDetail],
  });

  const { data: organization, executeFetchFn: fetchOrganization } = useFetchFn(
    () => getOrganizationById(organizationId || ''),
    { fetchKey: `organization-${organizationId}` },
  );

  useEffect(() => {
    if (!cancelLogId) return;
    fetchCancelLog();
    fetchOrganization();
  }, [cancelLogId, fetchCancelLog, fetchOrganization]);

  return (
    <TourSettlementCancelLogDetailContext
      value={{
        cancelLog,
        organization,
        isLoading: isLoading ?? false,
        fetchCancelLog,
      }}
    >
      {children}
    </TourSettlementCancelLogDetailContext>
  );
}
