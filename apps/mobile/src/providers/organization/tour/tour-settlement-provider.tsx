import { useFetch, useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { getReceiptPaymentsByTourSettlementId } from '@/apis/receipt-payment/receipt-payment-apis';
import {
  getSignaturesByDocumentId,
  signSignature,
  cancelSignature,
  manageReceiverSignatures as manageReceiverSignaturesFn,
} from '@/apis/signature/signature-apis';
import {
  getTourSettlementByTourId,
  updateTourSettlement as updateTourSettlementFn,
  getTourSettlementLogsByTourSettlementId,
} from '@/apis/tour/tour-settlement-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import {
  TourSettlementWithMeta,
  TourSettlementCancelLogResponse,
  UpdateTourSettlementRequest,
} from '@/interfaces/tour-settlement-interfaces';

interface TourSettlementContextType {
  tourSettlement: TourSettlementWithMeta | null | undefined;
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshingReceiptPayments: boolean;
  isUpdatingSettlement: boolean;
  refreshTourSettlement: () => void;
  refreshReceiptPayments: () => void;
  updateTourSettlement: (
    data: UpdateTourSettlementRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  cancelLogs: TourSettlementCancelLogResponse[];
  isLoadingCancelLogs: boolean;
  fetchCancelLogs: () => void;
  signatures: SignatureResponse[];
  isLoadingSignatures: boolean;
  fetchSignatures: () => void;
  refreshSignatures: () => void;
  organizationMembers: OrganizationMemberResponse[] | null | undefined;
  fetchOrganizationMembers: () => void;
  signTourSettlement: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  cancelTourSettlement: (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  manageReceiverSignatures: (
    targetUserIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isSigningTourSettlement: boolean;
  isCancelingTourSettlement: boolean;
  isManagingReceiverSignatures: boolean;
}

const TourSettlementContext = createContext<TourSettlementContextType | null>(null);

export function useTourSettlementContext() {
  const ctx = useContext(TourSettlementContext);
  if (!ctx) throw new Error('useTourSettlementContext must be used within TourSettlementProvider');
  return ctx;
}

export function TourSettlementProvider({
  tourId,
  children,
}: {
  tourId: string;
  children: React.ReactNode;
}) {
  const { data: tourSettlement, refreshFetch: refreshTourSettlement } = useFetch(
    () => getTourSettlementByTourId(tourId),
    {
      fetchKey: `tour-settlement-${tourId}`,
      tags: [FETCH_TAG.tourSettlementByTourId(tourId)],
    },
  );

  const {
    data: receiptPayments,
    refreshFetch: refreshReceiptPayments,
    isRefreshing: isRefreshingReceiptPayments,
  } = useFetch(() => getReceiptPaymentsByTourSettlementId(tourSettlement?.id || ''), {
    fetchKey: `organization-receipt-payment-list-in-tour-settlement-${tourSettlement?.id}`,
    tags: [
      FETCH_TAG.receiptPaymentListInTourSettlementByTourSettlementId(tourSettlement?.id || ''),
    ],
  });

  const { executeMutationFn: execUpdate, isMutating: isUpdatingSettlement } = useMutationFn(
    (data: UpdateTourSettlementRequest) => updateTourSettlementFn(tourSettlement?.id || '', data),
    { invalidatesTags: [FETCH_TAG.tourSettlementByTourId(tourId)] },
  );

  const updateTourSettlement = (
    data: UpdateTourSettlementRequest,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execUpdate(data, callbacks);

  const settlementId = tourSettlement?.id;
  const {
    data: cancelLogs,
    isLoading: isLoadingCancelLogs,
    executeFetchFn: fetchCancelLogs,
  } = useFetchFn(() => getTourSettlementLogsByTourSettlementId(settlementId || ''), {
    fetchKey: `tour-settlement-cancel-logs-${settlementId}`,
    tags: [FETCH_TAG.tourSettlementCancelLogsByTourSettlementId(settlementId || '')],
  });

  useEffect(() => {
    if (settlementId) fetchCancelLogs();
  }, [settlementId, fetchCancelLogs]);

  const tourOrganizationId = tourSettlement?.tour?.organizationId;

  const {
    data: signaturesData,
    isLoading: isLoadingSignatures,
    executeFetchFn: fetchSignatures,
    refreshFetchFn: refreshSignatures,
  } = useFetchFn(() => getSignaturesByDocumentId(settlementId || ''), {
    fetchKey: `signature-list-in-tour-settlement-${settlementId}`,
    tags: [FETCH_TAG.signatureListInTourSettlementByTourSettlementId(settlementId || '')],
  });

  const { data: organizationMembers, executeFetchFn: fetchOrganizationMembers } = useFetchFn(
    () => getOrganizationMembersByOrganizationId(tourOrganizationId || ''),
    {
      fetchKey: `organization-members-${tourOrganizationId}`,
      tags: [FETCH_TAG.memberList],
    },
  );

  const { executeMutationFn: execSign, isMutating: isSigningTourSettlement } = useMutationFn(
    (id: string) => signSignature(id),
    {
      invalidatesTags: [
        FETCH_TAG.signatureListInTourSettlementByTourSettlementId(settlementId || ''),
      ],
    },
  );

  const { executeMutationFn: execCancel, isMutating: isCancelingTourSettlement } = useMutationFn(
    (id: string) => cancelSignature(id),
    {
      invalidatesTags: [
        FETCH_TAG.signatureListInTourSettlementByTourSettlementId(settlementId || ''),
        FETCH_TAG.tourSettlementCancelLogsByTourSettlementId(settlementId || ''),
      ],
    },
  );

  const { executeMutationFn: execManageReceivers, isMutating: isManagingReceiverSignatures } =
    useMutationFn(
      (targetUserIds: string[]) =>
        manageReceiverSignaturesFn({
          documentId: settlementId || '',
          documentType: 'TOUR_SETTLEMENT',
          targetUserIds,
        }),
      {
        invalidatesTags: [
          FETCH_TAG.signatureListInTourSettlementByTourSettlementId(settlementId || ''),
        ],
      },
    );

  const signTourSettlement = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execSign(id, callbacks);
  const cancelTourSettlement = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => execCancel(id, callbacks);
  const manageReceiverSignatures = (
    targetUserIds: string[],
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => {
    if (!settlementId) return;
    execManageReceivers(targetUserIds, callbacks);
  };

  return (
    <TourSettlementContext
      value={{
        tourSettlement,
        receiptPayments: receiptPayments ?? [],
        isRefreshingReceiptPayments,
        isUpdatingSettlement,
        refreshTourSettlement,
        refreshReceiptPayments,
        updateTourSettlement,
        cancelLogs: cancelLogs ?? [],
        isLoadingCancelLogs: isLoadingCancelLogs ?? false,
        fetchCancelLogs,
        signatures: signaturesData ?? [],
        isLoadingSignatures: isLoadingSignatures ?? false,
        fetchSignatures,
        refreshSignatures,
        organizationMembers,
        fetchOrganizationMembers,
        signTourSettlement,
        cancelTourSettlement,
        manageReceiverSignatures,
        isSigningTourSettlement,
        isCancelingTourSettlement,
        isManagingReceiverSignatures,
      }}
    >
      {children}
    </TourSettlementContext>
  );
}
