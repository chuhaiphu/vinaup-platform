import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';

import { TourCalculationCancelLogModalContent } from './tour-calculation-cancel-log-modal-content';
interface TourCalculationCancelLogModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function TourCalculationCancelLogModal({ modalRef }: TourCalculationCancelLogModalProps) {
  return (
    <SlideSheet ref={modalRef} heightPercentage={0.9}>
      <TourCalculationCancelLogModalContent onCloseRequest={() => modalRef.current?.close()} />
    </SlideSheet>
  );
}
