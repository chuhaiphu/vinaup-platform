import Ionicons from '@react-native-vector-icons/ionicons/static';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import SignatureEntity from '@/components/commons/signature/signature-entity';
import VinaupArrowWithTail from '@/components/icons/vinaup-arrow-with-tail.native';
import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { useBookingDetailContext } from '@/providers/organization/booking/booking-detail-provider';
interface BookingSignatureSectionProps {
  onOpenSignatureInfoPopover?: () => void;
}

export default function BookingSignatureSection({
  onOpenSignatureInfoPopover,
}: BookingSignatureSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const signConfirmSlideSheetRef = useRef<SlideSheetRef | null>(null);
  const cancelConfirmSlideSheetRef = useRef<SlideSheetRef | null>(null);

  const { currentUser } = useAuthContext();
  const {
    booking,
    signatures: bookingSignatures,
    isLoadingSignatures: isLoading,
    fetchSignatures,
    signBooking,
    cancelBooking,
    isSigningBooking,
    isCancelingBooking,
  } = useBookingDetailContext();

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const handleOpenSignConfirmSlideSheet = (signatureId?: string, isAllowToSign: boolean = true) => {
    if (!signatureId || !isAllowToSign) return;
    setSelectedSignatureId(signatureId);
    signConfirmSlideSheetRef.current?.open();
  };

  const handleOpenCancelConfirmSlideSheet = (signatureId?: string) => {
    if (!signatureId) return;
    setSelectedSignatureId(signatureId);
    cancelConfirmSlideSheetRef.current?.open();
  };

  const handleConfirmSign = () => {
    if (!selectedSignatureId) return;
    signBooking(selectedSignatureId, {
      onSuccess: () => {
        signConfirmSlideSheetRef.current?.close();
      },
      onError: (error) => console.error('Error signing booking:', error),
    });
  };

  const handleConfirmCancel = () => {
    if (!selectedSignatureId) return;
    cancelBooking(selectedSignatureId, {
      onSuccess: () => {
        cancelConfirmSlideSheetRef.current?.close();
      },
      onError: (error) => console.error('Error canceling booking signature:', error),
    });
  };

  const sender = bookingSignatures?.find((s) => s.signatureRole === 'SENDER');
  const receiver = bookingSignatures?.find((s) => s.signatureRole === 'RECEIVER');
  const hasUnsignedSender =
    bookingSignatures?.some((s) => s.signatureRole === 'SENDER' && !s.isSigned) ?? false;
  const isBookingCompleted = !!receiver?.isSigned;

  const hasOrganizationCustomer = booking.organizationCustomer !== null;
  const isMutating = isSigningBooking || isCancelingBooking;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => setIsExpanded((prev) => !prev)} hitSlop={8}>
            <VinaupArrowWithTail
              width={16}
              height={16}
              color={COLORS.teal700}
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            />
          </Pressable>
          <Text style={styles.title}>Ký tên</Text>
          <PressableOpacity onPress={onOpenSignatureInfoPopover} hitSlop={8}>
            <Ionicons
              name="information-circle-sharp"
              size={ICON_SIZES.lg}
              color={COLORS.yellow400}
            />
          </PressableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.signaturesGroup}>
          <View style={styles.signatureColumnLeft}>
            <Text style={styles.roleText}>Người tạo</Text>
            <SignatureEntity
              isSigned={sender?.isSigned}
              isAllowToSign={!sender?.isSigned && sender?.targetUserId === currentUser?.id}
              isAllowToCancel={
                !isBookingCompleted &&
                !!sender?.isSigned &&
                sender?.signedByUserId === currentUser?.id
              }
              role="SENDER"
              isLoading={isLoading || isMutating}
              alignment="left"
              onSign={() => handleOpenSignConfirmSlideSheet(sender?.id, true)}
              onCancel={() => handleOpenCancelConfirmSlideSheet(sender?.id)}
            />
            <Text style={styles.nameText}>
              {sender?.signedByUser?.name ?? sender?.targetUser?.name}
            </Text>
            {sender?.isSigned && (
              <Text style={styles.timeText}>
                {dayjs(sender.signedAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            )}
          </View>

          {hasOrganizationCustomer && (
            <View style={styles.signatureColumnRight}>
              <Text style={styles.roleText}>Bên nhận</Text>
              <SignatureEntity
                isSigned={receiver?.isSigned}
                isAllowToSign={!receiver?.isSigned && !hasUnsignedSender}
                isAllowToCancel={false}
                role="RECEIVER"
                isLoading={isLoading || isMutating}
                alignment="right"
                onSign={() => handleOpenSignConfirmSlideSheet(receiver?.id, !hasUnsignedSender)}
                onCancel={() => handleOpenCancelConfirmSlideSheet(receiver?.id)}
              />
              {receiver?.isSigned && (
                <View style={styles.signatureInfo}>
                  <Text style={styles.nameText}>
                    {receiver.signedByUser?.name ?? receiver.signedByName}
                  </Text>
                  <Text style={styles.timeText}>
                    {dayjs(receiver.signedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <ConfirmSlideSheet
        ref={signConfirmSlideSheetRef}
        title="Xác nhận ký tên"
        confirmText="Xác nhận"
        cancelText="Huỷ"
        isLoading={isSigningBooking}
        onCloseCompleted={() => setSelectedSignatureId(null)}
        onConfirmPress={handleConfirmSign}
      />
      <ConfirmSlideSheet
        ref={cancelConfirmSlideSheetRef}
        title="Xác nhận huỷ ký"
        confirmText="Huỷ ký"
        cancelText="Đóng"
        isLoading={isCancelingBooking}
        onCloseCompleted={() => setSelectedSignatureId(null)}
        onConfirmPress={handleConfirmCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  signaturesGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureColumnLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  signatureColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  nameText: {
    fontSize: FONT_SIZES.sm,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginTop: SPACING['2xs'],
  },
  signatureInfo: {
    alignItems: 'flex-end',
  },
});
