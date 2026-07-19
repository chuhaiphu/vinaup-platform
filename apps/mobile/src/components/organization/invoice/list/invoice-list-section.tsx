import dayjs from 'dayjs';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { OrganizationInvoiceSummaryBar } from '@/components/organization/invoice/bars/organization-invoice-summary-bar';
import { InvoiceCard } from '@/components/organization/invoice/invoice-card';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS } from '@/constants/style-constants';
import { useOrganizationInvoiceListContext } from '@/providers/organization/invoice/organization-invoice-list-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';

export interface InvoiceListSectionProps {
  organizationId: string;
  selectedDate: dayjs.Dayjs;
  statusFilter: string;
  invoiceTypeCode: string;
  filterMode: DatePickerMode;
}

export function InvoiceListSection(_props: InvoiceListSectionProps) {
  const { invoices, allReceiptPayments, isRefreshing, refreshFetch } =
    useOrganizationInvoiceListContext();

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={invoices}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const invoiceRPs = allReceiptPayments.filter((rp) => rp.invoiceId === item.id);
          const { totalRemaining } = calculateReceiptPaymentsSummary(invoiceRPs);
          return <InvoiceCard invoice={item} totalRemaining={totalRemaining} />;
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFetch}
            colors={[COLORS.teal700]}
          />
        }
      />
      <OrganizationInvoiceSummaryBar invoices={invoices} />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
  },
});
