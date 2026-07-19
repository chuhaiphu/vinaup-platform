import { useLocalSearchParams } from 'expo-router';
import { Suspense } from 'react';

import {
  ReceiptPaymentDetailScreenContent,
  type ReceiptPaymentFormParams,
} from '@/components/commons/screen-contents/receipt-payment-detail-screen-content';
import { FlatInputFormSkeleton } from '@/components/commons/skeletons/flat-input-form-skeleton';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import { ReceiptPaymentFormProvider } from '@/providers/commons/receipt-payment/receipt-payment-form-provider';

export default function ReceiptPaymentDetailScreen() {
  const params = useLocalSearchParams<ReceiptPaymentFormParams>();
  const { receiptPaymentId } = params;
  const isUpdateMode = receiptPaymentId !== 'new';

  const formInvalidatesTags = (() => {
    switch (true) {
      case !!params.projectId:
        return [
          FETCH_TAG.receiptPaymentListInProjectByProjectId(params.projectId),
          FETCH_TAG.receiptPaymentListInProjectCollection,
        ];
      case !!params.invoiceId:
        return [
          FETCH_TAG.receiptPaymentListInInvoiceByInvoiceId(params.invoiceId),
          FETCH_TAG.receiptPaymentListInInvoiceCollection,
        ];
      case !!params.bookingId:
        return [FETCH_TAG.receiptPaymentListInBookingByBookingId(params.bookingId)];
      case !!params.tourCalculationId:
        return [
          FETCH_TAG.receiptPaymentListInTourCalculationByTourCalculationId(
            params.tourCalculationId,
          ),
        ];
      case !!params.tourImplementationId:
        return [
          FETCH_TAG.receiptPaymentListInTourImplementationByTourImplementationId(
            params.tourImplementationId,
          ),
        ];
      case !!params.tourSettlementId:
        return [
          FETCH_TAG.receiptPaymentListInTourSettlementByTourSettlementId(params.tourSettlementId),
        ];
      case !!params.wageId:
        return [
          FETCH_TAG.receiptPaymentListInWageByWageId(params.wageId),
          FETCH_TAG.receiptPaymentListInWageCollection,
        ];
      case !!params.tripId:
        return [FETCH_TAG.receiptPaymentListInTripByTripId(params.tripId)];
      case !!params.carMaintenanceLogId:
        return [
          FETCH_TAG.receiptPaymentListInCarMaintenanceLogByCarMaintenanceLogId(
            params.carMaintenanceLogId,
          ),
        ];
      default:
        return [FETCH_TAG.personalReceiptPaymentList];
    }
  })();

  return (
    <Suspense fallback={<FlatInputFormSkeleton />}>
      <ReceiptPaymentFormProvider
        receiptPaymentId={receiptPaymentId}
        isUpdateMode={isUpdateMode}
        invalidatesTags={formInvalidatesTags}
      >
        <ReceiptPaymentDetailScreenContent />
      </ReceiptPaymentFormProvider>
    </Suspense>
  );
}
