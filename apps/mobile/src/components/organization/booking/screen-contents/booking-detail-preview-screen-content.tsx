import Feather from '@react-native-vector-icons/feather/static';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import VinaupLeftArrowTwoLayers from '@/components/icons/vinaup-left-arrow-two-layers.native';
import VinaupSigningPen from '@/components/icons/vinaup-signing-pen.native';
import VinaupUserArrowUpRight from '@/components/icons/vinaup-user-arrow-up-right.native';
import VinaupUserChecked from '@/components/icons/vinaup-user-checked.native';
import { Button } from '@/components/primitives/button';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import { RECEIPT_PAYMENT_TYPE } from '@/constants/receipt-payment-constants';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { useReceiptPaymentListInBookingContext } from '@/providers/commons/receipt-payment/receipt-payment-list-in-booking-provider';
import { useBookingDetailContext } from '@/providers/organization/booking/booking-detail-provider';
import { generateFormatDateTime } from '@/utils/generator/string-generator/generate-format-date-time';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export function BookingDetailPreviewScreenContent() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { booking, signatures, isLoadingSignatures, fetchSignatures } = useBookingDetailContext();
  const { receiptPayments } = useReceiptPaymentListInBookingContext();

  useEffect(() => {
    if (!bookingId) return;
    fetchSignatures();
  }, [bookingId, fetchSignatures]);

  const isLoading = isLoadingSignatures;

  const groupedReceiptPayments = (() => {
    const groups = new Map<string, ReceiptPaymentResponse[]>();
    receiptPayments.forEach((item) => {
      const label = dayjs(item.transactionDate).isValid()
        ? dayjs(item.transactionDate).format(DD_MM_DATE_FORMAT_SHORT)
        : '-';
      const current = groups.get(label) || [];
      groups.set(label, [...current, item]);
    });
    return Array.from(groups.entries())
      .map(([label, items]) => ({
        label,
        items,
        sortTimestamp: dayjs(items[0]?.transactionDate).valueOf() || 0,
      }))
      .sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  })();

  const totalReceipt = receiptPayments
    .filter((p) => p.type === RECEIPT_PAYMENT_TYPE.RECEIPT)
    .reduce((sum, p) => sum + p.unitPrice * p.quantity * p.frequency, 0);

  const totalPayment = receiptPayments
    .filter((p) => p.type === RECEIPT_PAYMENT_TYPE.PAYMENT)
    .reduce((sum, p) => sum + p.unitPrice * p.quantity * p.frequency, 0);

  const balance = totalReceipt - totalPayment;

  const senderSignature = signatures?.find((s) => s.signatureRole === 'SENDER');
  const receiverSignature = signatures?.find((s) => s.signatureRole === 'RECEIVER');

  const customerName = booking?.organizationCustomer?.name || '-';

  const handleRetry = () => {
    if (!bookingId) return;
    fetchSignatures();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Xem trước Booking',
          headerTitleStyle: styles.headerTitleStyle,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
              <VinaupLeftArrowTwoLayers />
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.rightActions}>
              <Pressable style={[styles.actionBtn, styles.actionBtnDisabled]} disabled>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={ICON_SIZES.lg}
                  color={COLORS.teal700}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      {isLoading && !booking && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={COLORS.teal700} />
        </View>
      )}

      {!isLoading && !bookingId && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Thiếu mã booking.</Text>
        </View>
      )}

      {!isLoading && bookingId && !booking && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Không tải được dữ liệu booking.</Text>
          <Button style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </Button>
        </View>
      )}

      {booking && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Header box ── */}
          <View style={styles.headerBox}>
            <Text style={styles.bookingName}>{booking.description || '-'}</Text>
            <View style={styles.headerSubRow}>
              <Text style={styles.headerMeta} numberOfLines={1}>
                Từ: {generateFormatDateTime(booking.startDate ?? null)}
                {'  '}Đến: {generateFormatDateTime(booking.endDate ?? null)}
              </Text>
              <Text style={styles.bookingCode}>No.{booking.code || '-'}</Text>
            </View>
            {customerName !== '-' && (
              <Text style={styles.customerLine}>Khách hàng: {customerName}</Text>
            )}
          </View>

          {/* ── Table ── */}
          <View style={styles.tableContainer}>
            {groupedReceiptPayments.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có dữ liệu thu chi.</Text>
            ) : (
              <>
                <View style={styles.tableHead}>
                  <Text style={styles.thCol1}>Nội dung</Text>
                  <Text style={styles.thCol2}>Đơn giá</Text>
                  <Text style={styles.thCol3}>SL</Text>
                  <Text style={styles.thCol4}>Lần</Text>
                  <Text style={styles.thCol5}>Thành tiền</Text>
                </View>
                <View style={styles.thinDivider} />

                {groupedReceiptPayments.map((group) => (
                  <View key={group.label}>
                    <Text style={styles.groupDate}>{group.label}</Text>
                    {group.items.map((item) => {
                      const total = item.unitPrice * item.quantity * item.frequency;
                      return (
                        <View key={item.id} style={styles.tableRow}>
                          <Text style={styles.tdCol1} numberOfLines={2}>
                            {item.description || '-'}
                          </Text>
                          <Text style={styles.tdCol2}>
                            {generateLocaleFormatString(item.unitPrice)}
                          </Text>
                          <Text style={styles.tdCol3}>{item.quantity}</Text>
                          <Text style={styles.tdCol4}>{item.frequency}</Text>
                          <Text style={styles.tdCol5}>{generateLocaleFormatString(total)}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </>
            )}
          </View>

          {/* ── Summary ── */}
          <View style={styles.finRow}>
            <Text style={styles.finLabel}>Tổng thu</Text>
            <Text style={styles.finValue}>{generateLocaleFormatString(totalReceipt)}</Text>
          </View>
          <View style={styles.finRow}>
            <Text style={styles.finLabel}>Tổng chi</Text>
            <Text style={styles.finValue}>{generateLocaleFormatString(totalPayment)}</Text>
          </View>
          <View style={styles.finRow}>
            <Text style={styles.finLabel}>Số dư</Text>
            <Text style={[styles.finValue, balance < 0 && styles.colorNegative]}>
              {generateLocaleFormatString(balance)}
            </Text>
          </View>

          {/* ── Ghi chú ── */}
          {!!booking.note && (
            <>
              <View style={styles.thinDivider} />
              <View style={styles.noteRow}>
                <Feather name="message-square" size={ICON_SIZES.sm} color={COLORS.gray400} />
                <Text style={styles.noteText}>{booking.note}</Text>
              </View>
            </>
          )}

          <View style={styles.thinDivider} />

          {/* ── Parties ── */}
          <View style={styles.partiesBox}>
            <View style={styles.partyLeft}>
              <View style={styles.partyRoleRow}>
                <VinaupUserArrowUpRight />
                <Text style={styles.partyRoleText}> Bên tạo</Text>
              </View>
              <Text style={styles.partyName}>{booking.organization?.name || '-'}</Text>
            </View>
            <View style={styles.partyRight}>
              <View style={[styles.partyRoleRow, { justifyContent: 'flex-end' }]}>
                <Text style={styles.partyRoleText}>Bên nhận </Text>
                <VinaupUserChecked />
              </View>
              <Text style={[styles.partyName, { textAlign: 'right' }]}>{customerName}</Text>
            </View>
          </View>

          {/* ── Signatures ── */}
          {(senderSignature || receiverSignature) && (
            <View style={styles.sigRow}>
              <View style={styles.sigCol}>
                {senderSignature && (
                  <>
                    <View style={styles.sigStatusRow}>
                      <VinaupSigningPen
                        width={16}
                        height={15}
                        color={senderSignature.isSigned ? COLORS.orange500 : COLORS.gray400}
                      />
                      <Text
                        style={[
                          styles.sigStatusText,
                          {
                            color: senderSignature.isSigned ? COLORS.orange500 : COLORS.gray400,
                          },
                        ]}
                      >
                        {senderSignature.isSigned ? ' Đã ký' : ' Chờ ký'}
                      </Text>
                    </View>
                    <Text style={styles.sigName}>
                      {senderSignature.targetUser?.name || senderSignature.targetName || '-'}
                    </Text>
                    <Text style={styles.sigDate}>
                      {generateFormatDateTime(senderSignature.signedAt ?? null)}
                    </Text>
                  </>
                )}
              </View>

              <View style={[styles.sigCol, { alignItems: 'flex-end' }]}>
                {receiverSignature && (
                  <>
                    <View style={styles.sigStatusRow}>
                      <Text
                        style={[
                          styles.sigStatusText,
                          {
                            color: receiverSignature.isSigned ? COLORS.orange500 : COLORS.teal700,
                          },
                        ]}
                      >
                        {receiverSignature.isSigned ? 'Đã ký' : 'Chờ ký'}
                      </Text>
                      <VinaupSigningPen
                        width={16}
                        height={15}
                        color={receiverSignature.isSigned ? COLORS.orange500 : COLORS.teal700}
                      />
                    </View>
                    <Text style={[styles.sigName, { textAlign: 'right' }]}>
                      {receiverSignature.signedByUser?.name || receiverSignature.targetName || '-'}
                    </Text>
                    <Text style={[styles.sigDate, { textAlign: 'right' }]}>
                      {generateFormatDateTime(receiverSignature.signedAt ?? null)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          {!senderSignature && !receiverSignature && (
            <Text style={styles.emptyText}>Không có dữ liệu ký tên.</Text>
          )}

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <View style={styles.doubleLine} />
            <Text style={styles.footerText}>VinaUp.com (Ứng dụng thu chi & quản lý)</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  stateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  headerTitleStyle: {
    fontSize: FONT_SIZES.lg,
  },
  backBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.sm,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  headerBox: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  bookingName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  headerSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerMeta: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    color: COLORS.gray600,
  },
  bookingCode: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    color: COLORS.gray600,
  },
  customerLine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  thinDivider: {
    height: 1,
    backgroundColor: COLORS.gray300,
    marginVertical: SPACING.sm,
  },
  tableContainer: {
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray300,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  thCol1: {
    flex: 2.2,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  thCol2: {
    flex: 1.4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  thCol3: {
    flex: 0.7,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  thCol4: {
    flex: 0.7,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  thCol5: {
    flex: 1.5,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'right',
  },
  groupDate: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLORS.gray300,
  },
  tdCol1: {
    flex: 2.2,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    lineHeight: LINE_HEIGHTS.sm,
  },
  tdCol2: {
    flex: 1.4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  tdCol3: {
    flex: 0.7,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  tdCol4: {
    flex: 0.7,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  tdCol5: {
    flex: 1.5,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'right',
  },
  finRow: {
    flexDirection: 'row',
    paddingVertical: SPACING['2xs'],
  },
  finLabel: {
    flex: 3,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'right',
    paddingRight: SPACING.md,
  },
  finValue: {
    flex: 1.5,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'right',
  },
  colorNegative: {
    color: COLORS.orange500,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING['2xs'],
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    lineHeight: LINE_HEIGHTS.xs,
  },
  partiesBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  partyLeft: {
    flex: 1,
    gap: SPACING.xs,
  },
  partyRight: {
    flex: 1,
    gap: SPACING.xs,
  },
  partyRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyRoleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  partyName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  sigRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
  },
  sigCol: {
    flex: 1,
    gap: SPACING['2xs'],
  },
  sigStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sigStatusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sigName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  sigDate: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    color: COLORS.gray400,
  },
  footer: {
    marginTop: SPACING.xs,
  },
  doubleLine: {
    height: 3,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  emptyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    marginBottom: SPACING.sm,
  },
});
