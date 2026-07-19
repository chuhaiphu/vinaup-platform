import { useRouter } from 'expo-router';
import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  deleteWage as deleteWageFn,
  getWageById,
  updateWage as updateWageFn,
} from '@/apis/wage/wage-apis';
import { FETCH_TAG, getPersonalWageRippleTags } from '@/constants/fetch-tag-constants';
import { UpdateWageRequest, WageResponse } from '@/interfaces/wage-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface PersonalWageDetailContextType {
  wageId: string;
  wage: WageResponse;
  isRefreshingWage: boolean;
  isUpdatingWage: boolean;
  isDeletingWage: boolean;
  handleUpdateWage: (fields: UpdateWageRequest, onSuccess?: () => void) => void;
  handleDelete: (onStart?: () => void, onFinish?: () => void) => void;
  refreshWage: () => void;
}

const PersonalWageDetailContext = createContext<PersonalWageDetailContextType | null>(null);

export function usePersonalWageDetailContext() {
  const ctx = useContext(PersonalWageDetailContext);
  if (!ctx)
    throw new Error('usePersonalWageDetailContext must be used within PersonalWageDetailProvider');
  return ctx;
}

export function PersonalWageDetailProvider({
  wageId,
  children,
}: {
  wageId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    data: wage,
    isRefreshing: isRefreshingWage,
    refreshFetch: refreshWage,
  } = useFetch(() => getWageById(wageId), {
    fetchKey: `personal-wage-${wageId}`,
    tags: [FETCH_TAG.personalWageByWageId(wageId)],
  });

  const { executeMutationFn: updateWage, isMutating: isUpdatingWage } = useMutationFn(
    (updatedFields: UpdateWageRequest) => updateWageFn(wageId, updatedFields),
    {
      invalidatesTags: [...getPersonalWageRippleTags(), FETCH_TAG.personalWageByWageId(wageId)],
    },
  );

  const { executeMutationFn: deleteWage, isMutating: isDeletingWage } = useMutationFn(
    () => deleteWageFn(wageId),
    {
      invalidatesTags: getPersonalWageRippleTags(),
    },
  );

  const handleUpdateWage = useCallback(
    (updatedFields: UpdateWageRequest, onSuccessCallback?: () => void) => {
      updateWage(updatedFields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.'));
        },
      });
    },
    [updateWage],
  );

  const handleDelete = useCallback(
    (onStart?: () => void, onFinish?: () => void) => {
      if (!wageId) return;
      Alert.alert('Xác nhận', 'Bạn muốn xoá?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => {
            onStart?.();
            deleteWage({
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
    [wageId, deleteWage, router],
  );

  if (!wage) {
    return null;
  }

  return (
    <PersonalWageDetailContext
      value={{
        wageId,
        wage,
        isRefreshingWage,
        isUpdatingWage,
        isDeletingWage,
        handleUpdateWage,
        handleDelete,
        refreshWage,
      }}
    >
      {children}
    </PersonalWageDetailContext>
  );
}
