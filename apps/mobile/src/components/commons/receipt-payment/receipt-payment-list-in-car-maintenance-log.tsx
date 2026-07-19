import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { DD_MM_YYYY_DATE_FORMAT, HH_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { type DatePickerMode } from '@/constants/date-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentListInCarMaintenanceLogContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-car-maintenance-log-provider';
import { calculateReceiptPaymentsSummary } from '@/utils/calculator/calculate-receipt-payments-summary';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface ReceiptPaymentListInCarMaintenanceLogProps {
  carMaintenanceLogId: string;
  organizationId: string;
  categoryFilter: string;
  selectedDate: dayjs.Dayjs;
  filterMode: DatePickerMode;
}

export function ReceiptPaymentListInCarMaintenanceLog({
  carMaintenanceLogId,
  organizationId,
  categoryFilter,
  selectedDate,
  filterMode,
}: ReceiptPaymentListInCarMaintenanceLogProps) {
  const router = useRouter();
  const { receiptPayments, isRefreshing, refreshFetch } =
    useReceiptPaymentListInCarMaintenanceLogContext();

  // ─── Client-side filter: category + calendar window ─────
  // The endpoint returns every payment of this log; category & date are UI filters.
  const filteredReceiptPayments = receiptPayments
    .filter((rp) => (categoryFilter ? rp.categoryId === categoryFilter : true))
    .filter((rp) => dayjs(rp.transactionDate).isSame(selectedDate, filterMode))
    .sort((a, b) => dayjs(b.transactionDate).valueOf() - dayjs(a.transactionDate).valueOf());

  const totalCost = calculateReceiptPaymentsSummary(filteredReceiptPayments).totalPayment;

  const navigateToEdit = (item: ReceiptPaymentResponse) => {
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: item.id,
        organizationId,
        carMaintenanceLogId,
        receiptPaymentType: 'PAYMENT',
      },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredReceiptPayments}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFetch}
            colors={[COLORS.teal700]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có chi phí bảo trì</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {/* Mirror the tour-card date layout: date in default dark text, time in gray parentheses. */}
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                {dayjs(item.transactionDate).format(DD_MM_YYYY_DATE_FORMAT)}{' '}
                <Text style={styles.dateTimeText}>
                  ({dayjs(item.transactionDate).format(HH_MM_DATE_FORMAT_SHORT)})
                </Text>
              </Text>
            </View>
            <Pressable onPress={() => navigateToEdit(item)}>
              <ReceiptPaymentCard receiptPayment={item} />
            </Pressable>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Tổng chi phí: </Text>
        <Text style={styles.footerValue}>{generateLocaleFormatString(totalCost)} đ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {},
  listContent: {
    paddingVertical: SPACING.sm,
  },
  itemContainer: {
    marginBottom: SPACING.sm,
  },
  // Aligns with the card's horizontal inset (8) and follows the tour-card date header.
  dateRow: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
  },
  dateTimeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  // Matches the receipt-payments summary bar: fontSize 14, paddingVertical 10, thicker 1.5 top border.
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  footerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  footerValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
