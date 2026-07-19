import { useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import {
  getOrganizationCustomersByOrganizationId,
  createOrganizationCustomer,
} from '@/apis/organization/organization-customer-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  CreateOrganizationCustomerRequest,
  OrganizationCustomerResponse,
} from '@/interfaces/organization-customer-interfaces';

interface OrganizationCustomerContextType {
  organizationCustomers: OrganizationCustomerResponse[];
  isLoadingOrganizationCustomers: boolean;
  isRefreshingOrganizationCustomers: boolean;
  isCreatingCustomer: boolean;
  refreshOrganizationCustomers: () => void;
  createOrganizationCustomer: (
    data: CreateOrganizationCustomerRequest,
    callbacks?: {
      onSuccess?: (d: OrganizationCustomerResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
}

const OrganizationCustomerContext = createContext<OrganizationCustomerContextType | null>(null);

export function useOrganizationCustomerContext() {
  const ctx = useContext(OrganizationCustomerContext);
  if (!ctx)
    throw new Error(
      'useOrganizationCustomerContext must be used within OrganizationCustomerProvider',
    );
  return ctx;
}

export function OrganizationCustomerProvider({
  organizationId,
  children,
}: {
  organizationId: string | undefined;
  children: React.ReactNode;
}) {
  const {
    data: organizationCustomers,
    isLoading: isLoadingOrganizationCustomers,
    isRefreshing: isRefreshingOrganizationCustomers,
    executeFetchFn: fetchOrganizationCustomers,
    refreshFetchFn: refreshOrganizationCustomers,
  } = useFetchFn(() => getOrganizationCustomersByOrganizationId(organizationId!), {
    fetchKey: `organization-customers-${organizationId}`,
    tags: [FETCH_TAG.customerList],
  });

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationCustomers();
    }
  }, [organizationId, fetchOrganizationCustomers]);

  const { executeMutationFn: execCreate, isMutating: isCreatingCustomer } = useMutationFn(
    (data: CreateOrganizationCustomerRequest) => createOrganizationCustomer(data),
    { invalidatesTags: [FETCH_TAG.customerList] },
  );

  return (
    <OrganizationCustomerContext
      value={{
        organizationCustomers: organizationCustomers ?? [],
        isLoadingOrganizationCustomers,
        isRefreshingOrganizationCustomers,
        isCreatingCustomer,
        refreshOrganizationCustomers,
        createOrganizationCustomer: (data, cb) => execCreate(data, cb),
      }}
    >
      {children}
    </OrganizationCustomerContext>
  );
}
