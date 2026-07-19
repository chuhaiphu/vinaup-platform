import { useImperativeHandle } from 'react';

import { ReceiptPaymentListInTourCalculation } from '@/components/organization/tour/tour-calculation/sections/receipt-payment-list-in-tour-calculation';
import { TourCalculationTicketSummary } from '@/components/organization/tour/tour-calculation/sections/tour-calculation-ticket-summary';
import { useTourCalculationContext } from '@/providers/organization/tour/tour-calculation-provider';
import { calculateTourTicketSummaries } from '@/utils/calculator/calculate-tour-ticket-summaries';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface TourCalculationTicketSummaryReceiptPaymentListProps {
  tourId: string;
  organizationId?: string;
  ref?: React.Ref<{
    refreshData: {
      refreshTourCalculation: () => void;
      refreshReceiptPaymentsByTourCalculation: () => void;
    };
  }>;
}

export function TourCalculationTicketSummaryReceiptPaymentList({
  organizationId,
  ref,
}: TourCalculationTicketSummaryReceiptPaymentListProps) {
  const {
    tourCalculation,
    receiptPayments,
    isRefreshingReceiptPayments: isRefreshingReceiptPaymentsByTourCalculation,
    refreshTourCalculation,
    refreshReceiptPayments: refreshReceiptPaymentsByTourCalculation,
  } = useTourCalculationContext();

  const tourTicketSummaryData = calculateTourTicketSummaries(
    receiptPayments,
    tourCalculation || null,
  );

  useImperativeHandle(ref, () => ({
    refreshData: {
      refreshTourCalculation,
      refreshReceiptPaymentsByTourCalculation,
    },
  }));

  return (
    <>
      <TourCalculationTicketSummary
        id={tourCalculation?.id || ''}
        tourId={tourCalculation?.tourId || ''}
        onUpdated={refreshTourCalculation}
        adultTicketCount={tourCalculation?.adultTicketCount}
        childTicketCount={tourCalculation?.childTicketCount}
        adultTicketPrice={tourCalculation?.adultTicketPrice}
        childTicketPrice={tourCalculation?.childTicketPrice}
        taxRate={tourCalculation?.taxRate}
        totalReceipt={generateLocaleFormatString(tourTicketSummaryData.totalReceipt)}
        totalPayment={generateLocaleFormatString(tourTicketSummaryData.totalPayment)}
        vatGTGT={generateLocaleFormatString(tourTicketSummaryData.vatGTGT)}
        vatDeducted={generateLocaleFormatString(tourTicketSummaryData.vatDeducted)}
        totalTaxPay={generateLocaleFormatString(tourTicketSummaryData.totalTaxPay)}
        netProfitAfterTaxPay={generateLocaleFormatString(
          tourTicketSummaryData.netProfitAfterTaxPay,
        )}
        profitMarginAfterTaxPay={generateLocaleFormatString(
          tourTicketSummaryData.profitMarginAfterTaxPay,
          'vi-VN',
          2,
        )}
      />

      <ReceiptPaymentListInTourCalculation
        isRefreshing={isRefreshingReceiptPaymentsByTourCalculation}
        receiptPayments={receiptPayments ?? []}
        tourCalculationId={tourCalculation?.id}
        organizationId={organizationId}
      />
    </>
  );
}
