import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentSectionListHeader } from '@/components/commons/headers/receipt-payment-section-list-header';
import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';

interface TripExpenseReceiptPaymentListProps {
  receiptPayments: ReceiptPaymentResponse[];
  isRefreshing: boolean;
  tripId: string;
  organizationId?: string;
}

export function TripExpenseReceiptPaymentList({
  receiptPayments,
  isRefreshing,
  tripId,
  organizationId,
}: TripExpenseReceiptPaymentListProps) {
  const router = useRouter();

  const navigateToFormScreen = (receiptPaymentId?: string) => {
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: receiptPaymentId || 'new',
        tripId,
        organizationId,
        receiptPaymentType: 'PAYMENT',
      },
    });
  };

  return (
    <View style={styles.listContent}>
      <ReceiptPaymentSectionListHeader
        title="Tổng thu chi"
        receiptPayments={receiptPayments}
        onPressAddNew={() => navigateToFormScreen()}
        isSumCalculationIncluded={false}
      />
      {isRefreshing && (
        <View style={styles.refreshLoaderContainer}>
          <ActivityIndicator size="small" color={COLORS.teal700} />
        </View>
      )}
      {receiptPayments.length === 0 ? (
        <View style={styles.emptyGroup}>
          <Text style={styles.emptyGroupText}>Tạo thu chi</Text>
        </View>
      ) : (
        receiptPayments.map((item) => (
          <Pressable
            style={styles.itemContainer}
            key={item.id}
            onPress={() => navigateToFormScreen(item.id)}
          >
            <ReceiptPaymentCard receiptPayment={item} />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    marginTop: 0,
    marginBottom: SPACING.lg,
  },
  refreshLoaderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  itemContainer: {
    marginBottom: SPACING.xs,
  },
  emptyGroup: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
  },
  emptyGroupText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
