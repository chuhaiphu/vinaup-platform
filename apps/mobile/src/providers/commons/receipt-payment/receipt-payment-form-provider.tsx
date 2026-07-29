import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext } from 'react';

import {
  createReceiptPayment,
  updateReceiptPayment,
  deleteReceiptPayment as deleteReceiptPaymentFn,
  getReceiptPaymentById,
} from '@/apis/receipt-payment/receipt-payment-apis';
import {
  CreateReceiptPaymentRequest,
  ReceiptPaymentResponse,
} from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentFormContextType {
  existingReceiptPayment: ReceiptPaymentResponse | null | undefined;
  refreshDetail: () => void;
  createOrUpdateReceiptPayment: (
    data: CreateReceiptPaymentRequest | (() => CreateReceiptPaymentRequest),
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  deleteReceiptPayment: (callbacks?: {
    onSuccess?: () => void;
    onError?: (e: ApiError) => void;
  }) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

const ReceiptPaymentFormContext = createContext<ReceiptPaymentFormContextType | null>(null);

export function useReceiptPaymentFormContext() {
  const ctx = useContext(ReceiptPaymentFormContext);
  if (!ctx)
    throw new Error('useReceiptPaymentFormContext must be used within ReceiptPaymentFormProvider');
  return ctx;
}

export function ReceiptPaymentFormProvider({
  receiptPaymentId,
  isUpdateMode,
  invalidatesTags,
  children,
}: {
  receiptPaymentId: string;
  isUpdateMode: boolean;
  invalidatesTags: string[];
  children: React.ReactNode;
}) {
  const fetchKey = isUpdateMode
    ? `receipt-payment-detail-${receiptPaymentId}`
    : 'receipt-payment-detail-new';

  const { data: existingReceiptPayment, refreshFetch: refreshDetail } = useFetch(
    async () => {
      if (!isUpdateMode) return null;
      return getReceiptPaymentById(receiptPaymentId);
    },
    { fetchKey, tags: [fetchKey] },
  );

  const { executeMutationFn: execCreateOrUpdate, isMutating: isSaving } = useMutationFn(
    (data: CreateReceiptPaymentRequest) => {
      if (isUpdateMode) {
        return updateReceiptPayment(receiptPaymentId, data);
      }
      return createReceiptPayment(data);
    },
    { invalidatesTags },
  );

  const { executeMutationFn: execDelete, isMutating: isDeleting } = useMutationFn(
    () => deleteReceiptPaymentFn(receiptPaymentId),
    {
      invalidatesTags,
    },
  );

  const createOrUpdateReceiptPayment = (
    data: CreateReceiptPaymentRequest | (() => CreateReceiptPaymentRequest),
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => {
    const resolved = typeof data === 'function' ? data() : data;
    execCreateOrUpdate(resolved, callbacks);
  };

  const deleteReceiptPayment = (callbacks?: {
    onSuccess?: () => void;
    onError?: (e: ApiError) => void;
  }) => execDelete(undefined, callbacks);

  return (
    <ReceiptPaymentFormContext
      value={{
        existingReceiptPayment,
        refreshDetail,
        createOrUpdateReceiptPayment,
        deleteReceiptPayment,
        isSaving,
        isDeleting,
      }}
    >
      {children}
    </ReceiptPaymentFormContext>
  );
}
