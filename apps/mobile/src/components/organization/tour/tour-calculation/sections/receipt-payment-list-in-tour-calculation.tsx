import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { ReceiptPaymentSectionListHeader } from '@/components/commons/receipt-payment/receipt-payment-section-list-header';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentCategoryContext } from '@/providers/commons/receipt-payment/receipt-payment-category-provider';

interface ReceiptPaymentListInTourCalculationProps {
  receiptPayments: ReceiptPaymentResponse[];
  tourCalculationId?: string;
  organizationId?: string;
  isRefreshing: boolean;
}

export function ReceiptPaymentListInTourCalculation({
  receiptPayments,
  tourCalculationId,
  organizationId,
  isRefreshing,
}: ReceiptPaymentListInTourCalculationProps) {
  const router = useRouter();
  const { categories } = useReceiptPaymentCategoryContext();

  const receiptPaymentByCategoryIdMap = receiptPayments.reduce<
    Map<string | null, ReceiptPaymentResponse[]>
  >((map, rp) => {
    const key = rp.categoryId;
    const bucket = map.get(key) ?? [];
    bucket.push(rp);
    map.set(key, bucket);
    return map;
  }, new Map());

  // Each receipt payment category becomes a section. Sorted Z→A, intentional.
  const categorySectionList = [...categories]
    .sort((b, a) => a.name.localeCompare(b.name, 'vi'))
    .map((c) => ({
      categoryId: c.id,
      title: c.name,
      data: receiptPaymentByCategoryIdMap.get(c.id) ?? [],
    }));

  // Receipt payments with no category (categoryId = null) are surfaced in a red warning section at the bottom
  const receiptPaymentsOutOfCategory = receiptPaymentByCategoryIdMap.get(null) ?? [];

  const navigateToFormScreen = ({
    receiptPaymentId,
    categoryId,
    categoryName,
  }: {
    receiptPaymentId?: string;
    categoryId?: string | null;
    categoryName?: string | null;
  }) => {
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: receiptPaymentId || 'new',
        tourCalculationId,
        organizationId,
        categoryId: categoryId ?? undefined,
        categoryName: categoryId ? (categoryName ?? undefined) : undefined,
      },
    });
  };

  const renderOutOfCategoryReceiptPaymentsSection = () => {
    if (receiptPaymentsOutOfCategory.length === 0) return null;
    return (
      <View style={styles.outOfCategoryContainer}>
        <View style={styles.outOfCategoryHeader}>
          <Text style={styles.outOfCategoryHeaderText}>Thu chi nằm ngoài thể loại!</Text>
        </View>
        {receiptPaymentsOutOfCategory.map((item) => (
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
      {categorySectionList.map((section) => (
        <View key={section.categoryId}>
          <ReceiptPaymentSectionListHeader
            title={section.title}
            receiptPayments={section.data}
            onPressAddNew={() =>
              navigateToFormScreen({
                categoryId: section.categoryId,
                categoryName: section.title,
              })
            }
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
      {renderOutOfCategoryReceiptPaymentsSection()}
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
  outOfCategoryContainer: {
    marginTop: SPACING.md,
  },
  outOfCategoryHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  outOfCategoryHeaderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.red600,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
