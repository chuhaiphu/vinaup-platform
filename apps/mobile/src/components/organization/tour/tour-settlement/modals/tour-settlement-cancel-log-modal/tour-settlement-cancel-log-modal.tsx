import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';

import { TourSettlementCancelLogModalContent } from './tour-settlement-cancel-log-modal-content';
interface TourSettlementCancelLogModalProps {
  modalRef: React.RefObject<SlideSheetRef | null>;
}

export function TourSettlementCancelLogModal({ modalRef }: TourSettlementCancelLogModalProps) {
  return (
    <SlideSheet ref={modalRef} heightPercentage={0.9}>
      <TourSettlementCancelLogModalContent onCloseRequest={() => modalRef.current?.close()} />
    </SlideSheet>
  );
}
