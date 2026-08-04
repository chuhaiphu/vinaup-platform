import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { ReceiptPaymentSectionListHeader } from '@/components/commons/receipt-payment/receipt-payment-section-list-header';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentCategoryContext } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';
import { generateDayJsDateChain } from '@/utils/generator/string-generator/generate-day-js-date-chain';

interface ReceiptPaymentListInTourSettlementProps {
  receiptPayments: ReceiptPaymentResponse[];
  startDate: string;
  endDate: string;
  tourSettlementId?: string;
  organizationId?: string;
  isRefreshing: boolean;
}

export function ReceiptPaymentListInTourSettlement({
  receiptPayments,
  startDate,
  endDate,
  tourSettlementId,
  organizationId,
  isRefreshing,
}: ReceiptPaymentListInTourSettlementProps) {
  const router = useRouter();
  const { categories } = useReceiptPaymentCategoryContext();

  const generalServiceCategory = categories.find((c) => c.name === 'Dịch vụ chung');

  const dateRange = generateDayJsDateChain(startDate, endDate);
  const dateKeysInRange = new Set(dateRange.map((d) => d.format('YYYY-MM-DD')));
  const { receiptPaymentsInRange, receiptPaymentsOutOfRange, generalServiceReceiptPayments } =
    receiptPayments.reduce<{
      receiptPaymentsInRange: ReceiptPaymentResponse[];
      receiptPaymentsOutOfRange: ReceiptPaymentResponse[];
      generalServiceReceiptPayments: ReceiptPaymentResponse[];
    }>(
      (acc, rp) => {
        // ─── Step 1: "Dịch vụ chung" regardless of date ─────
        // These belong to a dedicated bottom section,
        // so they never fall into the date buckets or the "sai ngày" warning.
        if (rp.category?.name === 'Dịch vụ chung') {
          acc.generalServiceReceiptPayments.push(rp);
          return acc;
        }
        // ─── Step 2: Otherwise group by date / flag out-of-range ─────
        const key = dayjs(rp.transactionDate).format('YYYY-MM-DD');
        if (dateKeysInRange.has(key)) {
          acc.receiptPaymentsInRange.push(rp);
        } else {
          acc.receiptPaymentsOutOfRange.push(rp);
        }
        return acc;
      },
      {
        receiptPaymentsInRange: [],
        receiptPaymentsOutOfRange: [],
        generalServiceReceiptPayments: [],
      },
    );

  const receiptPaymentsInRangeMap = receiptPaymentsInRange.reduce<
    Record<string, ReceiptPaymentResponse[]>
  >((map, rp) => {
    const dateKey = dayjs(rp.transactionDate).format('YYYY-MM-DD');
    if (!map[dateKey]) map[dateKey] = [];
    map[dateKey].push(rp);
    return map;
  }, {});
  const receiptPaymentInRangeSections = dateRange.map((d) => {
    const key = d.format('YYYY-MM-DD');
    return {
      title: d.format(DD_MM_DATE_FORMAT_SHORT),
      dateKey: key,
      data: receiptPaymentsInRangeMap[key] || [],
    };
  });

  const navigateToFormScreen = ({
    receiptPaymentId,
    dateKey,
    categoryId,
    categoryName,
  }: {
    receiptPaymentId?: string;
    dateKey?: string;
    categoryId?: string | null;
    categoryName?: string | null;
  }) => {
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: receiptPaymentId || 'new',
        tourSettlementId,
        organizationId,
        transactionDate: dateKey || undefined,
        categoryId: categoryId ?? undefined,
        categoryName: categoryName ?? undefined,
      },
    });
  };

  const renderGeneralServiceReceiptPaymentsSection = () => {
    return (
      <View style={styles.generalServiceContainer}>
        <ReceiptPaymentSectionListHeader
          title={'Dịch vụ chung'}
          receiptPayments={generalServiceReceiptPayments}
          onPressAddNew={() =>
            navigateToFormScreen({
              categoryId: generalServiceCategory?.id,
              categoryName: 'Dịch vụ chung',
            })
          }
        />
        {generalServiceReceiptPayments.length === 0 ? (
          <View style={styles.emptyGroup}>
            <Text style={styles.emptyGroupText}>Tạo thu chi</Text>
          </View>
        ) : (
          generalServiceReceiptPayments.map((item) => (
            <Pressable
              style={styles.itemContainer}
              key={item.id}
              onPress={() => navigateToFormScreen({ receiptPaymentId: item.id })}
            >
              <ReceiptPaymentCard receiptPayment={item} />
            </Pressable>
          ))
        )}
      </View>
    );
  };

  const renderOutOfRangeReceiptPaymentsSection = () => {
    if (receiptPaymentsOutOfRange.length === 0) return null;
    return (
      <View style={styles.outOfRangeContainer}>
        <View style={styles.outOfRangeHeader}>
          <Text style={styles.outOfRangeHeaderText}>Thu chi bị sai ngày!</Text>
        </View>
        {receiptPaymentsOutOfRange.map((item) => (
          <Pressable
            style={styles.itemContainer}
            key={item.id}
            onPress={() => navigateToFormScreen({ receiptPaymentId: item.id })}
          >
            <ReceiptPaymentCard receiptPayment={item} />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.listContent}>
      {isRefreshing && (
        <View style={styles.refreshLoaderContainer}>
          <ActivityIndicator size="small" color={COLORS.teal700} />
        </View>
      )}
      {receiptPaymentInRangeSections.map((section) => (
        <View key={section.dateKey}>
          <ReceiptPaymentSectionListHeader
            title={section.title}
            receiptPayments={section.data}
            onPressAddNew={() => navigateToFormScreen({ dateKey: section.dateKey })}
          />
          {section.data.length === 0 ? (
            <View style={styles.emptyGroup}>
              <Text style={styles.emptyGroupText}>Tạo thu chi</Text>
            </View>
          ) : (
            section.data.map((item) => (
              <Pressable
                style={styles.itemContainer}
                key={item.id}
                onPress={() => navigateToFormScreen({ receiptPaymentId: item.id })}
              >
                <ReceiptPaymentCard receiptPayment={item} />
              </Pressable>
            ))
          )}
        </View>
      ))}
      {renderGeneralServiceReceiptPaymentsSection()}
      {renderOutOfRangeReceiptPaymentsSection()}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  listContent: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  refreshLoaderContainer: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
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
  generalServiceContainer: {
    marginTop: SPACING.md,
  },
  outOfRangeContainer: {
    marginTop: SPACING.md,
  },
  outOfRangeHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  outOfRangeHeaderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.red600,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
