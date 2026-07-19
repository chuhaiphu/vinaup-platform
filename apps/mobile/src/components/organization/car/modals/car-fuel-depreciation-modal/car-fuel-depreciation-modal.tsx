import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { FuelType } from '@/constants/car-constants';
import { CarResponse } from '@/interfaces/car-interfaces';
import { FuelPriceResponse } from '@/interfaces/fuel-price-interfaces';

import { CarFuelDepreciationModalContent } from './car-fuel-depreciation-modal-content';

export interface CarFuelDepreciationModalData {
  fuelType?: FuelType;
  fuelConsumption?: number;
  bankMortgageAmount?: number;
  electricity: number;
}

interface CarFuelDepreciationModalProps {
  car: CarResponse;
  fuelPrice: FuelPriceResponse | null;
  isSyncing?: boolean;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onSyncPress?: () => void;
  onConfirm?: (data: CarFuelDepreciationModalData, closeModal: () => void) => void;
}

export function CarFuelDepreciationModal({
  car,
  fuelPrice,
  isSyncing,
  isLoading,
  modalRef,
  onSyncPress,
  onConfirm,
}: CarFuelDepreciationModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Bảng giá nhiên liệu & Khấu hao"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <CarFuelDepreciationModalContent
        ref={modalContentRef}
        carFuelType={car.fuelType}
        carFuelConsumption={car.fuelConsumption}
        carBankMortgageAmount={car.bankMortgageAmount}
        fuelPrice={fuelPrice}
        isSyncing={isSyncing}
        isLoading={isLoading}
        onSyncPress={onSyncPress}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
