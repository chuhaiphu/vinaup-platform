import { useRef } from 'react';

import {
  ConfirmSlideSheet,
  ConfirmSlideSheetContentRef,
} from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';

import { SimpleTextInputModalContent } from './simple-text-input-modal-content';

interface SimpleTextInputModalProps {
  title: string;
  maxLength?: number;
  numberOfLines?: number;
  value?: string | null;
  placeholder?: string;
  isLoading?: boolean;
  modalRef: React.RefObject<SlideSheetRef | null>;
  onConfirm?: (value: string, closeModal: () => void) => void;
}

export function SimpleTextInputModal({
  title,
  maxLength,
  numberOfLines,
  value,
  placeholder,
  isLoading,
  modalRef,
  onConfirm,
}: SimpleTextInputModalProps) {
  const modalContentRef = useRef<ConfirmSlideSheetContentRef | null>(null);
  const closeModal = () => modalRef.current?.close();

  return (
    <ConfirmSlideSheet
      ref={modalRef}
      title={title}
      isLoading={isLoading}
      onConfirmPress={() => modalContentRef.current?.submit()}
    >
      <SimpleTextInputModalContent
        ref={modalContentRef}
        maxLength={maxLength}
        numberOfLines={numberOfLines}
        value={value}
        placeholder={placeholder}
        isLoading={isLoading}
        onSubmit={(val) => onConfirm?.(val, closeModal)}
      />
    </ConfirmSlideSheet>
  );
}
