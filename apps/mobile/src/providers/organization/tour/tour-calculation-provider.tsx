import { useFetch, useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { getReceiptPaymentsByTourCalculationId } from '@/apis/receipt-payment/receipt-payment-apis';
import {
  getSignaturesByDocumentId,
  signSignature,
  cancelSignature,
  manageReceiverSignatures as manageReceiverSignaturesFn,
} from '@/apis/signature/signature-apis';
import {
  getTourCalculationByTourId,
  updateTourCalculation as updateTourCalculationFn,
  getTourCalculationLogsByTourCalculationId,
} from '@/apis/tour/tour-calculation-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import {
  TourCalculationWithMeta,
  TourCalculationCancelLogResponse,
  UpdateTourCalculationRequest,
} from '@/interfaces/tour-calculation-interfaces';

interface TourCalculationContextType {
  tourCalculation: TourCalculationWithMeta | null | undefined;
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshingReceiptPayments: boolean;
  isUpdatingCalculation: boolean;
  refreshTourCalculation: () => void;
  refreshReceiptPayments: () => void;
  updateTourCalculation: (
    data: UpdateTourCalculationRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  cancelLogs: TourCalculationCancelLogResponse[];
  isLoadingCancelLogs: boolean;
  fetchCancelLogs: () => void;
  signatures: SignatureResponse[];
  isLoadingSignatures: boolean;
  fetchSignatures: () => void;
  refreshSignatures: () => void;
  organizationMembers: OrganizationMemberResponse[] | null | undefined;
  fetchOrganizationMembers: () => void;
  signTourCalculation: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  cancelTourCalculation: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  manageReceiverSignatures: (
    targetUserIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isSigningTourCalculation: boolean;
  isCancelingTourCalculation: boolean;
  isManagingReceiverSignatures: boolean;
}

const TourCalculationContext = createContext<TourCalculationContextType | null>(null);

export function useTourCalculationContext() {
  const ctx = useContext(TourCalculationContext);
  if (!ctx)
    throw new Error('useTourCalculationContext must be used within TourCalculationProvider');
  return ctx;
}

export function TourCalculationProvider({
  tourId,
  children,
}: {
  tourId: string;
  children: React.ReactNode;
}) {
  const { data: tourCalculation, refreshFetch: refreshTourCalculation } = useFetch(
    () => getTourCalculationByTourId(tourId),
    {
      fetchKey: `tour-calculation-${tourId}`,
      tags: [FETCH_TAG.tourCalculationByTourId(tourId)],
    },
  );

  const {
    data: receiptPayments,
    refreshFetch: refreshReceiptPayments,
    isRefreshing: isRefreshingReceiptPayments,
  } = useFetch(() => getReceiptPaymentsByTourCalculationId(tourCalculation?.id || ''), {
    fetchKey: `organization-receipt-payment-list-in-tour-calculation-${tourCalculation?.id}`,
    tags: [
      FETCH_TAG.receiptPaymentListInTourCalculationByTourCalculationId(tourCalculation?.id || ''),
    ],
  });

  const { executeMutationFn: execUpdate, isMutating: isUpdatingCalculation } = useMutationFn(
    (data: UpdateTourCalculationRequest) =>
      updateTourCalculationFn(tourCalculation?.id || '', data),
    { invalidatesTags: [FETCH_TAG.tourCalculationByTourId(tourId)] },
  );

  const updateTourCalculation = (
    data: UpdateTourCalculationRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execUpdate(data, callbacks);

  const calculationId = tourCalculation?.id;
  const {
    data: cancelLogs,
    isLoading: isLoadingCancelLogs,
    executeFetchFn: fetchCancelLogs,
  } = useFetchFn(() => getTourCalculationLogsByTourCalculationId(calculationId || ''), {
    fetchKey: `tour-calculation-cancel-logs-${calculationId}`,
    tags: [FETCH_TAG.tourCalculationCancelLogsByTourCalculationId(calculationId || '')],
  });

  useEffect(() => {
    if (calculationId) fetchCancelLogs();
  }, [calculationId, fetchCancelLogs]);

  const tourOrganizationId = tourCalculation?.tour?.organizationId;

  const {
    data: signaturesData,
    isLoading: isLoadingSignatures,
    executeFetchFn: fetchSignatures,
    refreshFetchFn: refreshSignatures,
  } = useFetchFn(() => getSignaturesByDocumentId(calculationId || ''), {
    fetchKey: `signature-list-in-tour-calculation-${calculationId}`,
    tags: [FETCH_TAG.signatureListInTourCalculationByTourCalculationId(calculationId || '')],
  });

  const { data: organizationMembers, executeFetchFn: fetchOrganizationMembers } = useFetchFn(
    () => getOrganizationMembersByOrganizationId(tourOrganizationId || ''),
    {
      fetchKey: `organization-members-${tourOrganizationId}`,
      tags: [FETCH_TAG.memberList],
    },
  );

  const { executeMutationFn: execSign, isMutating: isSigningTourCalculation } = useMutationFn(
    (id: string) => signSignature(id),
    {
      invalidatesTags: [
        FETCH_TAG.signatureListInTourCalculationByTourCalculationId(calculationId || ''),
      ],
    },
  );

  const { executeMutationFn: execCancel, isMutating: isCancelingTourCalculation } = useMutationFn(
    (id: string) => cancelSignature(id),
    {
      invalidatesTags: [
        FETCH_TAG.signatureListInTourCalculationByTourCalculationId(calculationId || ''),
        FETCH_TAG.tourCalculationCancelLogsByTourCalculationId(calculationId || ''),
      ],
    },
  );

  const { executeMutationFn: execManageReceivers, isMutating: isManagingReceiverSignatures } =
    useMutationFn(
      (targetUserIds: string[]) =>
        manageReceiverSignaturesFn({
          documentId: calculationId || '',
          documentType: 'TOUR_CALCULATION',
          targetUserIds,
        }),
      {
        invalidatesTags: [
          FETCH_TAG.signatureListInTourCalculationByTourCalculationId(calculationId || ''),
        ],
      },
    );

  const signTourCalculation = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execSign(id, callbacks);
  const cancelTourCalculation = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execCancel(id, callbacks);
  const manageReceiverSignatures = (
    targetUserIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => {
    if (!calculationId) return;
    execManageReceivers(targetUserIds, callbacks);
  };

  return (
    <TourCalculationContext
      value={{
        tourCalculation,
        receiptPayments: receiptPayments ?? [],
        isRefreshingReceiptPayments,
        isUpdatingCalculation,
        refreshTourCalculation,
        refreshReceiptPayments,
        updateTourCalculation,
        cancelLogs: cancelLogs ?? [],
        isLoadingCancelLogs: isLoadingCancelLogs ?? false,
        fetchCancelLogs,
        signatures: signaturesData ?? [],
        isLoadingSignatures: isLoadingSignatures ?? false,
        fetchSignatures,
        refreshSignatures,
        organizationMembers,
        fetchOrganizationMembers,
        signTourCalculation,
        cancelTourCalculation,
        manageReceiverSignatures,
        isSigningTourCalculation,
        isCancelingTourCalculation,
        isManagingReceiverSignatures,
      }}
    >
      {children}
    </TourCalculationContext>
  );
}
