import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useImperativeHandle } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentSectionListHeader } from '@/components/commons/headers/receipt-payment-section-list-header';
import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentListInBookingContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider';
import { generateDayJsDateChain } from '@/utils/generator/string-generator/generate-day-js-date-chain';

export interface ReceiptPaymentListInBookingRef {
  refresh: () => void;
}

interface ReceiptPaymentListInBookingProps {
  startDate: string;
  endDate: string;
  onRefresh?: () => void;
  bookingId: string;
  organizationId?: string;
  canEdit?: boolean;
  ref?: React.Ref<ReceiptPaymentListInBookingRef>;
}

export function ReceiptPaymentListInBooking({
  startDate,
  endDate,
  onRefresh,
  bookingId,
  organizationId,
  canEdit = true,
  ref,
}: ReceiptPaymentListInBookingProps) {
  const { receiptPayments, refreshFetch, isRefreshing } = useReceiptPaymentListInBookingContext();
  const router = useRouter();

  useImperativeHandle(ref, () => ({ refresh: refreshFetch }), [refreshFetch]);

  const dateRange = generateDayJsDateChain(startDate, endDate);

  const dateKeysInRange = new Set(dateRange.map((d) => d.format('YYYY-MM-DD')));
  const { receiptPaymentsInRange, receiptPaymentsOutOfRange } = receiptPayments.reduce<{
    receiptPaymentsInRange: ReceiptPaymentResponse[];
    receiptPaymentsOutOfRange: ReceiptPaymentResponse[];
  }>(
    (acc, rp) => {
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
  }: {
    receiptPaymentId?: string;
    dateKey?: string;
  }) => {
    if (!canEdit) return;
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: receiptPaymentId || 'new',
        bookingId,
        organizationId,
        receiptPaymentType: 'PAYMENT',
        transactionDate: dateKey || undefined,
      },
    });
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
    <SectionList
      scrollEnabled={false}
      sections={receiptPaymentInRangeSections}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            refreshFetch();
            onRefresh?.();
          }}
          colors={[COLORS.teal700]}
          tintColor={COLORS.teal700}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.itemContainer}
          key={item.id}
          onPress={() => navigateToFormScreen({ receiptPaymentId: item.id })}
          disabled={!canEdit}
        >
          <ReceiptPaymentCard receiptPayment={item} />
        </Pressable>
      )}
      renderSectionHeader={({ section: { title, data, dateKey } }) => (
        <ReceiptPaymentSectionListHeader
          title={title}
          receiptPayments={data}
          canAdd={canEdit}
          onPressAddNew={() =>
            navigateToFormScreen({
              dateKey,
            })
          }
        />
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <View style={styles.emptyGroup}>
            <Text style={styles.emptyGroupText}>Tạo thu chi</Text>
          </View>
        ) : null
      }
      ListFooterComponent={renderOutOfRangeReceiptPaymentsSection}
      contentContainerStyle={styles.listContent}
    />
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
    paddingBottom: SPACING.xl,
  },
  itemContainer: {
    marginBottom: SPACING.xs,
  },
  emptyGroup: {
    paddingHorizontal: SPACING.md,
  },
  emptyGroupText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
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
