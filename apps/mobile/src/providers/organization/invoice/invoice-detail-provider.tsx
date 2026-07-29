import { useRouter } from 'expo-router';
import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteInvoice as deleteInvoiceFn,
  getInvoiceById,
  updateInvoice as updateInvoiceFn,
} from '@/apis/invoice/invoice-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { InvoiceResponse, UpdateInvoiceRequest } from '@/interfaces/invoice-interfaces';
import { OrganizationAbilityProvider } from '@/providers/organization/organization-ability-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface InvoiceDetailContextType {
  invoiceId: string;
  invoice: InvoiceResponse;
  isRefreshingInvoice: boolean;
  isUpdatingInvoice: boolean;
  isDeletingInvoice: boolean;
  handleUpdateInvoice: (fields: UpdateInvoiceRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshInvoice: () => void;
}

const InvoiceDetailContext = createContext<InvoiceDetailContextType | null>(null);

export function useInvoiceDetailContext() {
  const ctx = useContext(InvoiceDetailContext);
  if (!ctx) throw new Error('useInvoiceDetailContext must be used within InvoiceDetailProvider');
  return ctx;
}

export function InvoiceDetailProvider({
  invoiceId,
  children,
}: {
  invoiceId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: invoice,
    isRefreshing: isRefreshingInvoice,
    refreshFetch: refreshInvoice,
  } = useFetch(() => getInvoiceById(invoiceId), {
    fetchKey: `organization-invoice-${invoiceId}`,
    tags: [FETCH_TAG.invoiceByInvoiceId(invoiceId)],
  });

  const { executeMutationFn: updateInvoice, isMutating: isUpdatingInvoice } = useMutationFn(
    (updatedFields: UpdateInvoiceRequest) => updateInvoiceFn(invoiceId, updatedFields),
    { invalidatesTags: [FETCH_TAG.invoiceList, FETCH_TAG.invoiceByInvoiceId(invoiceId)] },
  );

  const { executeMutationFn: deleteInvoice, isMutating: isDeletingInvoice } = useMutationFn(
    () => deleteInvoiceFn(invoiceId),
    {
      invalidatesTags: [FETCH_TAG.invoiceList],
    },
  );

  const handleUpdateInvoice = useCallback(
    (updatedFields: UpdateInvoiceRequest, onSuccessCallback?: () => void) => {
      updateInvoice(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateInvoice],
  );

  const handleDelete = useCallback(
    (onStart?: () => void, onFinish?: () => void) => {
      if (!invoiceId) return;
      Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            onStart?.();
            deleteInvoice(undefined, {
              onSuccess: () => {
                onFinish?.();
                router.back();
              },
              onError: (error: ApiError) => {
                onFinish?.();
                Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xóa.'));
              },
            });
          },
        },
      ]);
    },
    [invoiceId, deleteInvoice, router],
  );

  if (!invoice) {
    return null;
  }

  return (
    <InvoiceDetailContext
      value={{
        invoiceId,
        invoice,
        isRefreshingInvoice,
        isUpdatingInvoice,
        isDeletingInvoice,
        handleUpdateInvoice,
        handleDelete,
        refreshInvoice,
      }}
    >
      <OrganizationAbilityProvider organizationId={invoice.organizationId ?? ''}>
        {children}
      </OrganizationAbilityProvider>
    </InvoiceDetailContext>
  );
}
