import { RefreshControl, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { TripExpenseReceiptPaymentList } from '@/components/organization/trip/trip-expense/sections/trip-expense-receipt-payment-list';
import { TripExpenseSummary } from '@/components/organization/trip/trip-expense/sections/trip-expense-summary';
import { COLORS } from '@/constants/style-constants';
import { useReceiptPaymentListInTripContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-trip-provider';
import { useTripDetailContext } from '@/providers/organization/trip/trip-detail-provider';
import { calculateTripCostSummaries } from '@/utils/calculator/calculate-trip-cost-summaries';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export function TripCostScreenContent() {
  const { trip, tripId, refreshTrip, isRefreshingTrip } = useTripDetailContext();
  const { receiptPayments, refreshFetch, isRefreshing } = useReceiptPaymentListInTripContext();

  const summary = calculateTripCostSummaries(receiptPayments, {
    rentalPrice: trip.rentalPrice,
    taxRate: trip.taxRate,
    commissionRate: trip.commissionRate,
  });

  const handleRefresh = () => {
    refreshTrip();
    refreshFetch();
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={8}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshingTrip || isRefreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.teal700]}
          tintColor={COLORS.teal700}
        />
      }
    >
      <TripExpenseSummary
        onUpdated={refreshTrip}
        rentalPrice={trip.rentalPrice}
        taxRate={trip.taxRate}
        commissionRate={trip.commissionRate}
        totalReceipt={generateLocaleFormatString(summary.totalReceipt)}
        totalPayment={generateLocaleFormatString(summary.totalPayment)}
        vatGTGT={generateLocaleFormatString(summary.vatGTGT)}
        vatDeducted={generateLocaleFormatString(summary.vatDeducted)}
        totalTaxPay={generateLocaleFormatString(summary.totalTaxPay)}
        netProfitAfterTaxPay={generateLocaleFormatString(summary.netProfitAfterTaxPay)}
        profitMarginAfterTaxPay={generateLocaleFormatString(
          summary.profitMarginAfterTaxPay,
          'vi-VN',
          2,
        )}
      />
      <TripExpenseReceiptPaymentList
        receiptPayments={receiptPayments}
        isRefreshing={isRefreshing}
        tripId={tripId}
        organizationId={trip.organization?.id}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
