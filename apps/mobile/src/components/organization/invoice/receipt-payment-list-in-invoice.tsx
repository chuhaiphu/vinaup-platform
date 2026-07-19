import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ReceiptPaymentSectionListHeader } from '@/components/commons/headers/receipt-payment-section-list-header';
import { ReceiptPaymentCard } from '@/components/commons/receipt-payment/receipt-payment-card';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentListInInvoiceContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-invoice-provider';
import { useInvoiceTypeContext } from '@/providers/organization/invoice/invoice-type-provider';
import { generateDayJsDateChain } from '@/utils/generator/string-generator/generate-day-js-date-chain';

export interface ReceiptPaymentListInInvoiceRef {
  refresh: () => void;
}

interface ReceiptPaymentListInInvoiceProps {
  invoiceId: string;
  startDate: string;
  endDate: string;
  organizationId?: string;
  invoiceTypeId?: string;
  onRefreshingChange?: (isRefreshing: boolean) => void;
  ref?: React.Ref<ReceiptPaymentListInInvoiceRef>;
}

export function ReceiptPaymentListInInvoice({
  invoiceId,
  startDate,
  endDate,
  organizationId,
  invoiceTypeId,
  onRefreshingChange,
  ref,
}: ReceiptPaymentListInInvoiceProps) {
  const router = useRouter();
  const { receiptPayments, refreshFetch, isRefreshing } = useReceiptPaymentListInInvoiceContext();

  useImperativeHandle(ref, () => ({ refresh: refreshFetch }), [refreshFetch]);

  useEffect(() => {
    onRefreshingChange?.(isRefreshing);
  }, [isRefreshing, onRefreshingChange]);

  const dateRange = generateDayJsDateChain(startDate, endDate);
  const { getInvoiceTypeById } = useInvoiceTypeContext();
  const invoiceType = getInvoiceTypeById(invoiceTypeId || '');
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
    const receiptPaymentType = invoiceType?.code === 'BUY' ? 'PAYMENT' : 'RECEIPT';
    router.push({
      pathname: '/(protected)/receipt-payment-detail/[receiptPaymentId]',
      params: {
        receiptPaymentId: receiptPaymentId || 'new',
        invoiceId,
        organizationId,
        receiptPaymentType,
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
    <View style={styles.listContent}>
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
      {renderOutOfRangeReceiptPaymentsSection()}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
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
