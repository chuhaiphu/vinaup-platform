import PictureAsPdfIcon from '@expo/material-symbols/picture_as_pdf.xml';
import TableIcon from '@expo/material-symbols/table.xml';
import Feather from '@react-native-vector-icons/feather/static';
import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';

import { PdfPageSizeModal } from '@/components/commons/modals/pdf-page-size-modal/pdf-page-size-modal';
import VinaupUserArrowUpRight from '@/components/icons/vinaup-user-arrow-up-right.native';
import VinaupUserChecked from '@/components/icons/vinaup-user-checked.native';
import { Avatar } from '@/components/primitives/avatar';
import { Button } from '@/components/primitives/button';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { DD_MM_DATE_FORMAT_SHORT } from '@/constants/app-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  LINE_HEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { ReceiptPaymentResponse } from '@/interfaces/receipt-payment-interfaces';
import { SignatureResponse } from '@/interfaces/signature-interfaces';
import { TourSettlementCancelLogSnapshot } from '@/interfaces/tour-settlement-interfaces';
import { useTourSettlementCancelLogDetailContext } from '@/providers/organization/tour/tour-settlement-cancel-log-detail-provider';
import { calculateTourTicketSummaries } from '@/utils/calculator/calculate-tour-ticket-summaries';
import type { PdfPageSize } from '@/utils/generator/file-generator/html/generate-tour-cancel-log-html';
import { createAndShareTourSettlementCancelLogPdf } from '@/utils/generator/file-generator/pdf/create-and-share-tour-settlement-cancel-log-pdf';
import { generateFormatDateTime } from '@/utils/generator/string-generator/generate-format-date-time';
import { generateLocaleFormatString } from '@/utils/generator/string-generator/generate-locale-format-string';

export function TourSettlementCancelLogDetailScreenContent() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pageSizeModalRef = useRef<SlideSheetRef | null>(null);
  const { tourSettlementCancelLogId } = useLocalSearchParams<{
    tourSettlementCancelLogId?: string;
  }>();
  const { cancelLog, organization, isLoading, fetchCancelLog } =
    useTourSettlementCancelLogDetailContext();

  const snapshotSettlement: TourSettlementCancelLogSnapshot =
    cancelLog?.snapshotData?.tourSettlement ?? {};
  const snapshotSignatures: SignatureResponse[] = cancelLog?.snapshotData?.signatures ?? [];

  const receiptPayments = snapshotSettlement.receiptPayments ?? [];

  const ticketSummary = calculateTourTicketSummaries(receiptPayments, {
    adultTicketCount: Number(snapshotSettlement.adultTicketCount),
    childTicketCount: Number(snapshotSettlement.childTicketCount),
    adultTicketPrice: Number(snapshotSettlement.adultTicketPrice),
    childTicketPrice: Number(snapshotSettlement.childTicketPrice),
    taxRate: Number(snapshotSettlement.taxRate),
  });

  const groupedReceiptPayments = (() => {
    const groups = new Map<string, ReceiptPaymentResponse[]>();

    receiptPayments.forEach((item) => {
      const groupLabel = dayjs(item.transactionDate).isValid()
        ? dayjs(item.transactionDate).format(DD_MM_DATE_FORMAT_SHORT)
        : '-';

      const current = groups.get(groupLabel) || [];
      groups.set(groupLabel, [...current, item]);
    });

    return Array.from(groups.entries())
      .map(([label, items]) => ({
        label,
        items,
        sortTimestamp: dayjs(items[0]?.transactionDate).valueOf() || 0,
      }))
      .sort((a, b) => b.sortTimestamp - a.sortTimestamp);
  })();

  const senderSignature = snapshotSignatures.find(
    (signature) => signature.signatureRole === 'SENDER',
  );

  const receiverSignatures = snapshotSignatures.filter(
    (signature) => signature.signatureRole === 'RECEIVER',
  );

  const customerName = snapshotSettlement.tour?.externalCustomerName || '-';

  const totalExpectedCount =
    Number(snapshotSettlement.adultTicketCount) + Number(snapshotSettlement.childTicketCount);

  const handleRetry = () => {
    if (!tourSettlementCancelLogId) {
      return;
    }
    fetchCancelLog();
  };

  const handleExportPdf = async (pageSize: PdfPageSize) => {
    if (!cancelLog || isGeneratingPdf) {
      return;
    }

    try {
      setIsGeneratingPdf(true);

      await createAndShareTourSettlementCancelLogPdf({
        cancelLog,
        organization: organization || undefined,
        tourCancelLogSnapshot: snapshotSettlement,
        ticketSummary,
        groupedReceiptPayments,
        senderSignature,
        receiverSignatures,
        customerName,
        totalExpectedCount,
        pageSize,
      });
    } catch {
      Alert.alert('Không thể xuất PDF', 'Vui lòng thử lại sau.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePressPdf = () => {
    if (!cancelLog || isGeneratingPdf) {
      return;
    }
    pageSizeModalRef.current?.open();
  };

  const handleSelectPageSize = (pageSize: PdfPageSize) => {
    pageSizeModalRef.current?.close();
    handleExportPdf(pageSize);
  };

  return (
    <View style={styles.container}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.select<ToolbarIcon>({ ios: 'doc.richtext', android: PictureAsPdfIcon })}
          disabled={isGeneratingPdf || !cancelLog}
          accessibilityLabel="Xuất PDF"
          onPress={handlePressPdf}
        />
        <Stack.Toolbar.Button
          icon={Platform.select<ToolbarIcon>({ ios: 'tablecells', android: TableIcon })}
          disabled
          accessibilityLabel="Xuất Excel"
        />
      </Stack.Toolbar>

      <PdfPageSizeModal
        modalRef={pageSizeModalRef}
        isLoading={isGeneratingPdf}
        onSelectA4={() => {
          handleSelectPageSize('A4');
        }}
        onSelectA5={() => {
          handleSelectPageSize('A5');
        }}
      />

      {isLoading && !cancelLog && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={COLORS.teal700} />
        </View>
      )}

      {!isLoading && !tourSettlementCancelLogId && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Thiếu mã nhật ký hủy ký.</Text>
        </View>
      )}

      {!isLoading && tourSettlementCancelLogId && !cancelLog && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Không tải được dữ liệu nhật ký.</Text>
          <Button style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </Button>
        </View>
      )}

      {cancelLog && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerTitleRow}>
            <Text style={styles.mainTitle}>Quyết toán</Text>
            <Avatar
              imgSrc={organization?.avatarUrl}
              size={AVATAR_SIZES.md}
              icon={<MaterialIcons name="groups" size={ICON_SIZES.lg} color={COLORS.teal700} />}
            />
          </View>
          <View style={styles.subHeaderRow}>
            <Text style={styles.orgName}>{organization?.name || '-'}</Text>
            <Text style={styles.dateText}>{generateFormatDateTime(cancelLog.createdAt)}</Text>
          </View>

          <View style={styles.thickDivider} />

          <View style={styles.section}>
            <Text style={styles.tourName}>Tên: {snapshotSettlement.tour?.description || '-'}</Text>
            <View style={styles.tourSubInfoRow}>
              <Text style={styles.tourTime}>
                Từ {generateFormatDateTime(snapshotSettlement.tour?.startDate ?? null)} đến{' '}
                {generateFormatDateTime(snapshotSettlement.tour?.endDate ?? null)}
              </Text>
              <Text style={styles.tourNo}>No.{snapshotSettlement.tour?.code || '-'}</Text>
            </View>
          </View>

          <View style={styles.thinDivider} />

          <View style={styles.section}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.summaryHeaderCol1}>Tổng (Thực tế) = {totalExpectedCount}</Text>
              <Text style={styles.summaryHeaderCol2}>S.lượng</Text>
              <Text style={styles.summaryHeaderCol3}>Giá bán</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.summaryBodyCol1}>Khách lớn</Text>
              <Text style={styles.summaryBodyCol2}>
                {Number(snapshotSettlement.adultTicketCount)}
              </Text>
              <Text style={styles.summaryBodyCol3}>
                {generateLocaleFormatString(Number(snapshotSettlement.adultTicketPrice))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.summaryBodyCol1}>Trẻ em</Text>
              <Text style={styles.summaryBodyCol2}>
                {Number(snapshotSettlement.childTicketCount)}
              </Text>
              <Text style={styles.summaryBodyCol3}>
                {generateLocaleFormatString(Number(snapshotSettlement.childTicketPrice))}
              </Text>
            </View>
          </View>

          <View style={styles.thinDivider} />

          <View style={styles.financialSection}>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>Tổng thu</Text>
              <Text style={styles.finValue}>
                {generateLocaleFormatString(ticketSummary.totalReceipt)}
              </Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>Tổng chi</Text>
              <Text style={styles.finValueBold}>
                {generateLocaleFormatString(ticketSummary.totalPayment)}
              </Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>
                Thuế phải nộp {Number(snapshotSettlement.taxRate)} %
              </Text>
              <Text style={styles.finValue}>
                {generateLocaleFormatString(ticketSummary.totalTaxPay)}
              </Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>Lợi nhuận sau thuế</Text>
              <Text style={styles.finValue}>
                {generateLocaleFormatString(ticketSummary.netProfitAfterTaxPay)}
              </Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>Tỷ suất lợi nhuận</Text>
              <Text style={styles.finValue}>
                {generateLocaleFormatString(ticketSummary.profitMarginAfterTaxPay)}%
              </Text>
            </View>
          </View>

          <Text style={styles.detailsTitle}>Chi tiết thu chi</Text>
          <View style={styles.mediumDivider} />

          {groupedReceiptPayments.length === 0 && (
            <Text style={styles.emptyText}>Chưa có dữ liệu thu chi.</Text>
          )}

          {groupedReceiptPayments.map((group) => (
            <View key={group.label}>
              <View style={styles.section}>
                <Text style={styles.dateGroupTitle}>{group.label}</Text>
                <View style={styles.thinDivider} />
                <View style={styles.detailHeaderRow}>
                  <Text style={styles.receiptPaymentHeaderCol1}>Tên nội dung</Text>
                  <Text style={styles.receiptPaymentHeaderCol2}>Đơn giá</Text>
                  <Text style={styles.receiptPaymentHeaderCol3}>SLượng</Text>
                  <Text style={styles.receiptPaymentHeaderCol4}>SLần</Text>
                  <Text style={styles.receiptPaymentHeaderCol5}>Thành tiền</Text>
                </View>
                <View style={styles.thinDivider} />

                {group.items.map((item) => {
                  const total = item.unitPrice * item.quantity * item.frequency;
                  return (
                    <View style={styles.detailRow} key={item.id}>
                      <Text style={styles.receiptPaymentCellCol1} numberOfLines={2}>
                        {item.description || '-'}
                      </Text>
                      <Text style={styles.receiptPaymentCellCol2}>
                        {generateLocaleFormatString(item.unitPrice)}
                      </Text>
                      <Text style={styles.receiptPaymentCellCol3}>{item.quantity}</Text>
                      <Text style={styles.receiptPaymentCellCol4}>{item.frequency}</Text>
                      <Text style={styles.receiptPaymentCellCol5}>
                        {generateLocaleFormatString(total)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.thinDivider} />
            </View>
          ))}

          <View style={styles.notesSection}>
            <Feather name="message-square" size={ICON_SIZES.md} color={COLORS.gray700} />
            <Text style={styles.noteText}>{snapshotSettlement.tour?.note || '-'}</Text>
          </View>

          <View style={styles.thinDivider} />

          <View style={styles.partiesSection}>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>Bên bán</Text>
              <Text style={styles.partyValue}>{organization?.name || '-'}</Text>
            </View>
            <View style={styles.partyColRight}>
              <Text style={styles.partyLabel}>Tên đoàn</Text>
              <Text style={styles.partyValueTeal}>{customerName}</Text>
            </View>
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>Ký tên</Text>
            <View style={styles.mediumDivider} />

            <View style={styles.sigRowSpace}>
              <Text style={styles.cancelText}>
                Hủy bởi: {cancelLog.canceledByUser?.name || '-'}
              </Text>
              <Text style={styles.sigDateTextItalic}>
                {generateFormatDateTime(cancelLog.createdAt)}
              </Text>
            </View>

            <View style={styles.thinDivider} />

            {senderSignature && (
              <View style={styles.sigBlock}>
                <View style={styles.sigRowSpace}>
                  <View style={styles.sigRoleWrap}>
                    <VinaupUserArrowUpRight />
                    <Text style={styles.sigRoleItalic}> Tạo:</Text>
                  </View>
                  <Text style={styles.sigDateTextItalic}>
                    {generateFormatDateTime(senderSignature.signedAt || null)}
                  </Text>
                </View>
                <View style={styles.sigRowSpace}>
                  <Text style={styles.sigName}>
                    {senderSignature.targetUser?.name || senderSignature.targetName || '-'}
                  </Text>
                  <Text style={styles.sigStatus}>
                    {senderSignature.isSigned ? '(Đã ký)' : '(Chưa ký)'}
                  </Text>
                </View>
              </View>
            )}

            {receiverSignatures.map((receiver) => (
              <View style={styles.sigBlock} key={receiver.id}>
                <View style={styles.sigRowSpace}>
                  <View style={styles.sigRoleWrap}>
                    <VinaupUserChecked />
                    <Text style={styles.sigRoleItalic}> Nhận:</Text>
                  </View>
                  <Text style={styles.sigDateTextItalic}>
                    {generateFormatDateTime(receiver.signedAt || null)}
                  </Text>
                </View>
                <View style={styles.sigRowSpace}>
                  <Text style={styles.sigName}>
                    {receiver.targetUser?.name || receiver.targetName || '-'}
                  </Text>
                  <Text style={styles.sigStatus}>
                    {receiver.isSigned ? '(Đã ký)' : '(Chưa ký)'}
                  </Text>
                </View>
              </View>
            ))}

            {!senderSignature && receiverSignatures.length === 0 && (
              <Text style={styles.emptyText}>Không có dữ liệu ký tên.</Text>
            )}
          </View>
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
    color: COLORS.gray600,
    fontSize: FONT_SIZES.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  retryButtonText: {
    color: COLORS.teal700,
    fontSize: FONT_SIZES.sm,
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
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING['2xl'],
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  mainTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgName: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    flex: 1,
    marginRight: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  thickDivider: {
    height: 4,
    backgroundColor: COLORS.teal700,
    marginVertical: SPACING.sm,
  },
  mediumDivider: {
    height: 2,
    backgroundColor: COLORS.teal700,
    marginVertical: SPACING.sm,
  },
  thinDivider: {
    height: 1,
    backgroundColor: COLORS.gray300,
    marginVertical: SPACING.sm,
  },
  section: {
    paddingVertical: SPACING.xs,
  },
  tourName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  tourSubInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tourTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontStyle: 'italic',
    flex: 1,
  },
  tourNo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    fontStyle: 'italic',
    marginLeft: SPACING.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryHeaderCol1: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 2,
    textAlign: 'left',
  },
  summaryHeaderCol2: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 1,
    textAlign: 'right',
  },
  summaryHeaderCol3: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    fontWeight: FONT_WEIGHTS.medium,
    flex: 1.5,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryBodyCol1: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 2,
  },
  summaryBodyCol2: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1,
    textAlign: 'right',
  },
  summaryBodyCol3: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.5,
    textAlign: 'right',
  },
  financialSection: {
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  finRow: {
    flexDirection: 'row',
  },
  finLabel: {
    flex: 3,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'right',
  },
  finValue: {
    flex: 1.5,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    textAlign: 'right',
  },
  finValueBold: {
    flex: 1.5,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    textAlign: 'right',
  },
  detailsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    marginBottom: SPACING.sm,
  },
  dateGroupTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  receiptPaymentHeaderCol1: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 2,
  },
  receiptPaymentHeaderCol2: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.2,
    textAlign: 'center',
  },
  receiptPaymentHeaderCol3: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.1,
    textAlign: 'center',
  },
  receiptPaymentHeaderCol4: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.1,
    textAlign: 'center',
  },
  receiptPaymentHeaderCol5: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.5,
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  receiptPaymentCellCol1: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 2,
  },
  receiptPaymentCellCol2: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.1,
    textAlign: 'center',
  },
  receiptPaymentCellCol3: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.1,
    textAlign: 'center',
  },
  receiptPaymentCellCol4: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.1,
    textAlign: 'center',
  },
  receiptPaymentCellCol5: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1.5,
    textAlign: 'right',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  noteText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.sm,
    color: COLORS.gray400,
    flex: 1,
  },
  partiesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  partyCol: {
    gap: SPACING.xs,
    flex: 1,
  },
  partyColRight: {
    gap: SPACING.xs,
    alignItems: 'flex-end',
    flex: 1,
  },
  partyLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textDecorationLine: 'underline',
  },
  partyValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  partyValueTeal: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  signatureSection: {
    paddingVertical: SPACING.xs,
  },
  signatureTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  cancelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    flex: 1,
  },
  sigBlock: {
    marginBottom: SPACING.md,
  },
  sigRowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sigRoleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sigRoleItalic: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    color: COLORS.gray900,
  },
  sigDateTextItalic: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  sigName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
    flex: 1,
  },
  sigStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  footer: {
    backgroundColor: COLORS.white,
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
});
