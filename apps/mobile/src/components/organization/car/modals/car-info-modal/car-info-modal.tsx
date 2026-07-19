import type { ImagePickerAsset } from 'expo-image-picker';
import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { CarResponse } from '@/interfaces/car-interfaces';

import { CarInfoModalContent } from './car-info-modal-content';

export interface CarInfoModalData {
  name?: string;
  youtubeUrl?: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  seatCount?: number;
  inServiceDate?: string;
  pickedImage?: ImagePickerAsset;
}

interface CarInfoModalProps {
  car: CarResponse;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (data: CarInfoModalData, closeModal: () => void) => void;
}

export function CarInfoModal({ car, isLoading, modalRef, onConfirm }: CarInfoModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title="Chỉnh sửa thông tin"
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <CarInfoModalContent
        ref={modalContentRef}
        carName={car.name}
        carYoutubeUrl={car.youtubeUrl}
        carFeatureImageUrl={car.featureImageUrl}
        carManufacturer={car.manufacturer}
        carModel={car.model}
        carCategory={car.category}
        carSeatCount={car.seatCount}
        carInServiceDate={car.inServiceDate}
        isLoading={isLoading}
        onSubmit={(data) => onConfirm?.(data, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
