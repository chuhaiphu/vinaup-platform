import { useFetch, useMutationFn, type ApiError } from 'fetchwire';
import { createContext, useCallback, useContext } from 'react';
import { Alert } from 'react-native';

import {
  getFuelPrice,
  syncFuelPrice as syncFuelPriceFn,
  updateFuelPriceElectricity as updateFuelPriceElectricityFn,
} from '@/apis/fuel-price/fuel-price-apis';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { FuelPriceResponse, UpdateFuelPriceRequest } from '@/interfaces/fuel-price-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface FuelPriceContextType {
  fuelPrice: FuelPriceResponse | null;
  isSyncingFuelPrice: boolean;
  isUpdatingElectricity: boolean;
  handleSyncFuelPrice: (onSuccess?: () => void) => void;
  handleUpdateElectricity: (fields: UpdateFuelPriceRequest, onSuccess?: () => void) => void;
  refreshFuelPrice: () => void;
}

const FuelPriceContext = createContext<FuelPriceContextType | null>(null);

export function useFuelPriceContext() {
  const ctx = useContext(FuelPriceContext);
  if (!ctx) throw new Error('useFuelPriceContext must be used within FuelPriceProvider');
  return ctx;
}

export function FuelPriceProvider({ children }: { children: React.ReactNode }) {
  const { data: fuelPrice, refreshFetch: refreshFuelPrice } = useFetch(() => getFuelPrice(), {
    fetchKey: 'fuel-price',
    tags: [FETCH_TAG.fuelPrice],
  });

  const { executeMutationFn: syncFuelPrice, isMutating: isSyncingFuelPrice } = useMutationFn(
    () => syncFuelPriceFn(),
    { invalidatesTags: [FETCH_TAG.fuelPrice] },
  );

  const { executeMutationFn: updateFuelPriceElectricity, isMutating: isUpdatingElectricity } =
    useMutationFn((fields: UpdateFuelPriceRequest) => updateFuelPriceElectricityFn(fields), {
      invalidatesTags: [FETCH_TAG.fuelPrice],
    });

  const handleSyncFuelPrice = useCallback(
    (onSuccessCallback?: () => void) => {
      syncFuelPrice(undefined, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert(
            'Lỗi',
            generateErrorMessage(error, 'Có lỗi xảy ra khi đồng bộ giá nhiên liệu.'),
          );
        },
      });
    },
    [syncFuelPrice],
  );

  const handleUpdateElectricity = useCallback(
    (fields: UpdateFuelPriceRequest, onSuccessCallback?: () => void) => {
      updateFuelPriceElectricity(fields, {
        onSuccess: () => {
          onSuccessCallback?.();
        },
        onError: (error: ApiError) => {
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật giá điện.'));
        },
      });
    },
    [updateFuelPriceElectricity],
  );

  return (
    <FuelPriceContext
      value={{
        fuelPrice: fuelPrice ?? null,
        isSyncingFuelPrice,
        isUpdatingElectricity,
        handleSyncFuelPrice,
        handleUpdateElectricity,
        refreshFuelPrice,
      }}
    >
      {children}
    </FuelPriceContext>
  );
}
