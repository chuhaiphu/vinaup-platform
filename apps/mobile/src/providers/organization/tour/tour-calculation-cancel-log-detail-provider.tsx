import { useFetchFn } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getOrganizationById } from '@/apis/organization/organization-apis';
import { getTourCalculationCancelLogById } from '@/apis/tour/tour-calculation-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationResponse } from '@/interfaces/organization-interfaces';
import { TourCalculationCancelLogResponse } from '@/interfaces/tour-calculation-interfaces';

interface TourCalculationCancelLogDetailContextType {
  cancelLog: TourCalculationCancelLogResponse | null | undefined;
  organization: OrganizationResponse | null | undefined;
  isLoading: boolean;
  fetchCancelLog: () => void;
}

const TourCalculationCancelLogDetailContext =
  createContext<TourCalculationCancelLogDetailContextType | null>(null);

export function useTourCalculationCancelLogDetailContext() {
  const ctx = useContext(TourCalculationCancelLogDetailContext);
  if (!ctx)
    throw new Error(
      'useTourCalculationCancelLogDetailContext must be used within TourCalculationCancelLogDetailProvider',
    );
  return ctx;
}

export function TourCalculationCancelLogDetailProvider({
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
  } = useFetchFn(() => getTourCalculationCancelLogById(cancelLogId), {
    fetchKey: `tour-calculation-cancel-log-${cancelLogId}`,
    tags: [FETCH_TAG.tourCalculationCancelLogDetail],
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
    <TourCalculationCancelLogDetailContext
      value={{
        cancelLog,
        organization,
        isLoading: isLoading ?? false,
        fetchCancelLog,
      }}
    >
      {children}
    </TourCalculationCancelLogDetailContext>
  );
}
