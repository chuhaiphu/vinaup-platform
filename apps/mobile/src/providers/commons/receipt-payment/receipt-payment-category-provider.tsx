import { useFetchFn, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useContext, useEffect } from 'react';

import {
  createReceiptPaymentCategory,
  updateReceiptPaymentCategory,
  deleteReceiptPaymentCategory,
  getReceiptPaymentCategoriesByOrganizationId,
  getReceiptPaymentCategoriesOfCurrentUser,
} from '@/apis/category/receipt-payment-category-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentCategoryResponse } from '@/interfaces/receipt-payment-interfaces';

interface ReceiptPaymentCategoryContextType {
  categories: ReceiptPaymentCategoryResponse[];
  isLoading: boolean;
  fetchCategories: () => void;
  createCategory: (
    name: string,
    callbacks?: {
      onSuccess?: (data: ReceiptPaymentCategoryResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  updateCategory: (
    params: { id: string; name: string },
    callbacks?: {
      onSuccess?: (data: ReceiptPaymentCategoryResponse | null) => void;
      onError?: (e: ApiError) => void;
    },
  ) => void;
  deleteCategory: (
    categoryId: string,
    callbacks?: { onSuccess?: () => void; onError?: (e: ApiError) => void },
  ) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const ReceiptPaymentCategoryContext = createContext<ReceiptPaymentCategoryContextType | null>(null);

export function useReceiptPaymentCategoryContext() {
  const ctx = useContext(ReceiptPaymentCategoryContext);
  if (!ctx)
    throw new Error(
      'useReceiptPaymentCategoryContext must be used within ReceiptPaymentCategoryProvider',
    );
  return ctx;
}

export function ReceiptPaymentCategoryProvider({
  organizationId,
  children,
}: {
  organizationId?: string;
  children: React.ReactNode;
}) {
  const cacheKey = FETCH_TAG.receiptPaymentCategoryListByOrganizationId(organizationId);

  const fetchFn = organizationId
    ? () => getReceiptPaymentCategoriesByOrganizationId(organizationId)
    : getReceiptPaymentCategoriesOfCurrentUser;

  const {
    data: categories,
    isLoading,
    executeFetchFn: fetchCategories,
  } = useFetchFn(fetchFn, { fetchKey: cacheKey, tags: [cacheKey] });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const { executeMutationFn: execCreate, isMutating: isCreating } = useMutationFn(
    (name: string) => createReceiptPaymentCategory({ name, organizationId }),
    { invalidatesTags: [cacheKey] },
  );

  const { executeMutationFn: execUpdate, isMutating: isUpdating } = useMutationFn(
    ({ id, name }: { id: string; name: string }) => updateReceiptPaymentCategory(id, { name }),
    { invalidatesTags: [cacheKey] },
  );

  const { executeMutationFn: execDelete, isMutating: isDeleting } = useMutationFn(
    (categoryId: string) => deleteReceiptPaymentCategory(categoryId),
    { invalidatesTags: [cacheKey] },
  );

  return (
    <ReceiptPaymentCategoryContext
      value={{
        categories: categories ?? [],
        isLoading: isLoading ?? false,
        fetchCategories,
        createCategory: (name, cb) => execCreate(name, cb),
        updateCategory: (params, cb) => execUpdate(params, cb),
        deleteCategory: (id, cb) => execDelete(id, cb as Parameters<typeof execDelete>[1]),
        isCreating,
        isUpdating,
        isDeleting,
      }}
    >
      {children}
    </ReceiptPaymentCategoryContext>
  );
}
