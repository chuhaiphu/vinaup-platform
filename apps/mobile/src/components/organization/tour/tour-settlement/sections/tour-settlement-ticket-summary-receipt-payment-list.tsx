import { useImperativeHandle } from 'react';

import { ReceiptPaymentListInTourSettlement } from '@/components/organization/tour/tour-settlement/sections/receipt-payment-list-in-tour-settlement';
import { TourSettlementTicketSummary } from '@/components/organization/tour/tour-settlement/sections/tour-settlement-ticket-summary';
import { useTourDetailContext } from '@/providers/organization/tour/tour-detail-provider';
import { useTourSettlementContext } from '@/providers/organization/tour/tour-settlement-provider';
import { calculateTourTicketSummaries } from '@/utils/calculator/calculate-tour-ticket-summaries';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface TourSettlementTicketSummaryReceiptPaymentListProps {
  tourId: string;
  organizationId?: string;
  ref?: React.Ref<{
    refreshData: {
      refreshTourSettlement: () => void;
      refreshReceiptPaymentsByTourSettlement: () => void;
    };
  }>;
}

export function TourSettlementTicketSummaryReceiptPaymentList({
  organizationId,
  ref,
}: TourSettlementTicketSummaryReceiptPaymentListProps) {
  const {
    tourSettlement,
    receiptPayments,
    isRefreshingReceiptPayments: isRefreshingReceiptPaymentsByTourSettlement,
    refreshTourSettlement,
    refreshReceiptPayments: refreshReceiptPaymentsByTourSettlement,
  } = useTourSettlementContext();

  const { tour } = useTourDetailContext();

  const tourTicketSummaryData = calculateTourTicketSummaries(
    receiptPayments,
    tourSettlement || null,
  );

  useImperativeHandle(ref, () => ({
    refreshData: {
      refreshTourSettlement,
      refreshReceiptPaymentsByTourSettlement,
    },
  }));

  return (
    <>
      <TourSettlementTicketSummary
        id={tourSettlement?.id || ''}
        tourId={tourSettlement?.tourId || ''}
        onUpdated={refreshTourSettlement}
        adultTicketCount={tourSettlement?.adultTicketCount}
        childTicketCount={tourSettlement?.childTicketCount}
        adultTicketPrice={tourSettlement?.adultTicketPrice}
        childTicketPrice={tourSettlement?.childTicketPrice}
        taxRate={tourSettlement?.taxRate}
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
      <ReceiptPaymentListInTourSettlement
        isRefreshing={isRefreshingReceiptPaymentsByTourSettlement}
        receiptPayments={receiptPayments ?? []}
        startDate={tour?.startDate ?? ''}
        endDate={tour?.endDate ?? ''}
        tourSettlementId={tourSettlement?.id}
        organizationId={organizationId}
      />
    </>
  );
}
