import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import { EntityDetailSkeleton } from '@/components/commons/skeletons/entity-detail-skeleton';
import { BookingDetailPreviewScreenContent } from '@/components/organization/booking/screen-contents/booking-detail-preview-screen-content';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { ReceiptPaymentListInBookingProvider } from '@/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider';
import { BookingDetailProvider } from '@/providers/organization/booking/booking-detail-provider';

export default function BookingDetailPreviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <ErrorBoundary>
      <Suspense fallback={<EntityDetailSkeleton />}>
        <BookingDetailProvider bookingId={bookingId || ''}>
          <ReceiptPaymentListInBookingProvider
            key={`receipt-payment-list-in-booking-${bookingId}`}
            bookingId={bookingId || ''}
          >
            <BookingDetailPreviewScreenContent />
          </ReceiptPaymentListInBookingProvider>
        </BookingDetailProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
