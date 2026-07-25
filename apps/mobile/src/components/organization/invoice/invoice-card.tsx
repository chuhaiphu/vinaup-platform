import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getInvoiceById } from '@/apis/invoice/invoice-apis';
import { DateRangeText } from '@/components/commons/texts/date-range-text';
import { InvoiceStatusDisplay } from '@/constants/invoice-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { InvoiceResponse } from '@/interfaces/invoice-interfaces';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

interface InvoiceCardProps {
  invoice?: InvoiceResponse;
  totalRemaining?: number;
}

export function InvoiceCard({ invoice, totalRemaining }: InvoiceCardProps) {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const getInvoiceInfoText = () => {
    if (!invoice) return '';
    if (invoice.organizationCustomer) {
      return invoice.organizationCustomer.name || '';
    }
    return invoice.externalCustomerName || invoice.externalOrganizationName || '—';
  };

  const navigateToDetail = async (invoiceId: string) => {
    setIsNavigating(true);
    try {
      await prefetch(() => getInvoiceById(invoiceId), {
        fetchKey: `organization-invoice-${invoiceId}`,
      });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/invoice-detail/[invoiceId]',
      params: { invoiceId, invoiceType: invoice?.type },
    });
    setIsNavigating(false);
  };

  if (!invoice) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerHeader}>
        <View style={styles.left}>
          <DateRangeText start={invoice.startDate} end={invoice.endDate} />
        </View>
        <View style={styles.right}>
          <Text style={styles.statusText}>{InvoiceStatusDisplay[invoice.status]}</Text>
        </View>
      </View>
      <Pressable onPress={() => navigateToDetail(invoice.id)}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.descriptionContainer}>
              <Text ellipsizeMode="tail" numberOfLines={2} style={styles.descriptionText}>
                {invoice.description}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPriceText}>
                {generateLocaleFormatString(totalRemaining ?? 0, 'vi-VN')}
              </Text>
              <Text style={styles.unitText}>đ</Text>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {getInvoiceInfoText()}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  innerHeader: {
    marginVertical: SPACING.sm,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  left: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  right: {},
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionContainer: {
    flex: 2,
  },
  descriptionText: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  totalPriceText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray700,
  },
  unitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
});
