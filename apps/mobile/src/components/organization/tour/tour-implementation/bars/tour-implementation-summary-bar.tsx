import { Alert } from 'react-native';

import { ReceiptPaymentsSummaryBar } from '@/components/commons/bars/receipt-payments-summary-bar';
import { useReceiptPaymentListInTourImplementationContext } from '@/providers/organization/tour/receipt-payment-list-in-tour-implementation-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

export function TourImplementationSummaryBar() {
  const { allReceiptPayments } = useReceiptPaymentListInTourImplementationContext();
  const {
    tourImplementation,
    isMemberAssigned,
    isUpdatingImplementation,
    updateTourImplementation,
  } = useTourImplementationContext();

  // ─── Deposit total (Đặt cọc) ─────
  // Combine both sub-tabs: sum depositAmount over every receipt-payment in the
  // implementation (allReceiptPayments already holds the full set).
  const depositTotal = allReceiptPayments.reduce((sum, rp) => sum + (rp.depositAmount ?? 0), 0);

  return (
    <ReceiptPaymentsSummaryBar
      receiptPayments={allReceiptPayments}
      isIncludedSubTotal={false}
      isIncludedAdvance
      entityAdvanceAmount={tourImplementation.advanceAmount}
      entityAdvanceType={tourImplementation.advanceType ?? 'BANK'}
      isUpdatingAdvance={isUpdatingImplementation}
      onUpdateAdvance={
        isMemberAssigned
          ? ({ advanceAmount, advanceType }, onSuccessCallback) =>
              updateTourImplementation(
                { advanceAmount: Number(advanceAmount) || 0, advanceType },
                {
                  onSuccess: onSuccessCallback,
                  onError: (e) =>
                    Alert.alert(
                      'Lỗi',
                      generateErrorMessage(e, 'Có lỗi xảy ra khi cập nhật tạm ứng.'),
                    ),
                },
              )
          : undefined
      }
      isIncludedDeposit
      depositTotal={depositTotal}
    />
  );
}
