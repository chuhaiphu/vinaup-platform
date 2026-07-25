import type { ImagePickerAsset } from 'expo-image-picker';
import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { CarResponse } from '@/interfaces/car-interfaces';

import { CarInfoModalContent } from './car-info-modal-content';

// Every editable field is nullable, not just optional: emptying an input means "clear this column",
// which only an explicit null can express — an omitted key would mean "leave it unchanged".
export interface CarInfoModalData {
  name?: string | null;
  youtubeUrl?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  category?: string | null;
  seatCount?: number | null;
  inServiceDate?: string | null;
  pickedImage?: ImagePickerAsset; // not a column — the asset to upload, so it stays optional-only
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
