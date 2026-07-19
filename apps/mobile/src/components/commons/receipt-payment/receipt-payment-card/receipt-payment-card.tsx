import { Text, View } from 'react-native';

import {
  RECEIPT_PAYMENT_GROUP_CODE,
  ReceiptPaymentGroupCode,
  ReceiptPaymentGroupCodeDisplay,
} from '@/constants/receipt-payment-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

import { styles } from './receipt-payment-card.styles';

interface ReceiptPaymentCardProps {
  receiptPayment?: ReceiptPaymentResponse;
}

/**
 * Displays a single receipt or payment entry as a card.
 *
 * Shows the description prefixed with `+`/`-` based on type, a category tag,
 * and a breakdown row of unit price × quantity × frequency = total.
 *
 */
export function ReceiptPaymentCard({ receiptPayment }: ReceiptPaymentCardProps) {
  if (!receiptPayment) {
    return (
      <View style={styles.container}>
        <View style={styles.contentTop}>
          <Text>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }
  const tourImplementationReceiptPayment = receiptPayment.tourImplementationReceiptPayments?.[0];
  const total =
    receiptPayment.quantity * (receiptPayment.frequency ?? 1) * receiptPayment.unitPrice;
  const depositAmount = receiptPayment.depositAmount ?? 0;
  const isTourGuideHandover =
    tourImplementationReceiptPayment?.groupCode === RECEIPT_PAYMENT_GROUP_CODE.FOR_TOUR_GUIDE;

  // ─── Decide which bottom parts to render ─────
  const showDepositSplit = depositAmount > 0;
  // The "Điều hành" label is never rendered (hidden for a cleaner card),
  // for group the bottom block only holds the deposit split — hide it entirely
  // The "Bàn giao HDV" always keeps its label, its block stays visible even without a deposit.
  const showContentBottom =
    !!tourImplementationReceiptPayment && (showDepositSplit || isTourGuideHandover);
  return (
    <View style={styles.container}>
      <View style={[styles.contentTop, showContentBottom && styles.contentTopAttached]}>
        <View style={styles.topRow}>
          <View style={styles.descriptionContainer}>
            <Text ellipsizeMode="tail" numberOfLines={2} style={styles.descriptionText}>
              {receiptPayment.type === 'PAYMENT' ? '-' : '+'} {receiptPayment.description}
            </Text>
          </View>
          <View style={styles.tagContainer}>
            <Text numberOfLines={1} style={styles.tagText}>
              {receiptPayment.category?.name ?? ''}
            </Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.unitPriceContainer}>
            <Text style={styles.unitPriceText}>
              {generateLocaleFormatString(receiptPayment.unitPrice)}
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <Text style={styles.multiplySign}>x</Text>
            <Text style={styles.quantityText}>{receiptPayment.quantity}</Text>
            <Text style={styles.multiplySign}>
              {receiptPayment.frequency === 1 ? undefined : 'x'}
            </Text>
            <Text style={styles.quantityText}>
              {receiptPayment.frequency === 1 ? undefined : receiptPayment.frequency}
            </Text>
            <Text style={styles.equalSign}>=</Text>
          </View>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceText}>{generateLocaleFormatString(total)}</Text>
          </View>
        </View>
      </View>
      {showContentBottom && (
        <View style={styles.contentBottom}>
          <View style={styles.metaRow}>
            {/* Keep the container as a flex spacer even when the label is
                hidden, so the deposit split stays right-aligned (no layout jump). */}
            <View style={styles.groupCodeContainer}>
              {isTourGuideHandover && (
                <Text style={styles.groupCodeText}>
                  {
                    ReceiptPaymentGroupCodeDisplay[
                      tourImplementationReceiptPayment.groupCode as ReceiptPaymentGroupCode
                    ]
                  }
                </Text>
              )}
            </View>
            {showDepositSplit && (
              <View style={styles.depositContainer}>
                <Text style={styles.depositText}>
                  Đặt cọc: {generateLocaleFormatString(depositAmount)}
                </Text>
                <Text style={styles.paymentText}>
                  Thanh toán: {generateLocaleFormatString(total - depositAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
