import Feather from '@react-native-vector-icons/feather/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import dayjs from 'dayjs';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SignerSelectModal } from '@/components/commons/modals/signer-select-modal/signer-select-modal';
import SignatureEntity from '@/components/commons/signature/signature-entity';
import VinaupArrowWithTail from '@/components/icons/vinaup-arrow-with-tail.native';
import { TourCalculationCancelLogModal } from '@/components/organization/tour/tour-calculation/modals/tour-calculation-cancel-log-modal/tour-calculation-cancel-log-modal';
import { Button } from '@/components/primitives/button';
import { ConfirmSlideSheet } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { useTourCalculationContext } from '@/providers/organization/tour/tour-calculation-provider';

export interface TourCalculationSignatureRef {
  refresh: () => void;
}

interface TourCalculationSignatureProps {
  onOpenSignatureInfoPopover?: () => void;
  ref?: React.Ref<TourCalculationSignatureRef>;
}

export default function TourCalculationSignature({
  onOpenSignatureInfoPopover,
  ref,
}: TourCalculationSignatureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };
  const modalRef = useRef<SlideSheetRef | null>(null);
  const cancelLogModalRef = useRef<SlideSheetRef | null>(null);
  const signConfirmSlideSheetRef = useRef<SlideSheetRef | null>(null);
  const cancelConfirmSlideSheetRef = useRef<SlideSheetRef | null>(null);
  const handleOpenSignerSelectModal = () => {
    modalRef.current?.open();
  };
  const handleOpenCancelLogModal = () => {
    cancelLogModalRef.current?.open();
  };

  const { currentUser } = useAuthContext();
  const {
    tourCalculation,
    signatures: tourCalculationSignatures,
    isLoadingSignatures: isLoading,
    fetchSignatures,
    refreshSignatures,
    organizationMembers,
    fetchOrganizationMembers,
    signTourCalculation,
    cancelTourCalculation,
    manageReceiverSignatures,
    isSigningTourCalculation,
    isCancelingTourCalculation,
    isManagingReceiverSignatures,
  } = useTourCalculationContext();

  const calculationId = tourCalculation?.id;

  useImperativeHandle(ref, () => ({ refresh: refreshSignatures }), [refreshSignatures]);

  useEffect(() => {
    if (!calculationId) return;
    fetchSignatures();
    fetchOrganizationMembers();
  }, [calculationId, fetchSignatures, fetchOrganizationMembers]);

  const handleConfirmSelectedOrganizationMembers = (
    selectedOrganizationMemberUserIds: string[],
    onSuccessCallback?: () => void,
  ) => {
    const senderUserId = tourCalculationSignatures?.find(
      (sig) => sig.signatureRole === 'SENDER',
    )?.targetUserId;

    const selectedOrganizationMemberUserIdsWithoutSender = selectedOrganizationMemberUserIds.filter(
      (id) => id !== senderUserId,
    );

    manageReceiverSignatures(selectedOrganizationMemberUserIdsWithoutSender, {
      onSuccess: () => {
        if (onSuccessCallback) {
          onSuccessCallback();
        }
        modalRef.current?.close();
      },
      onError: (error) => {
        console.error('Error managing receiver signatures:', error);
      },
    });
  };

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

  const handleConfirmSignTourCalculation = () => {
    if (!selectedSignatureId) return;

    signTourCalculation(selectedSignatureId, {
      onSuccess: () => {
        signConfirmSlideSheetRef.current?.close();
      },
      onError: (error) => {
        console.error('Error signing tour calculation:', error);
      },
    });
  };

  const handleConfirmCancelTourCalculation = () => {
    if (!selectedSignatureId) return;

    cancelTourCalculation(selectedSignatureId, {
      onSuccess: () => {
        cancelConfirmSlideSheetRef.current?.close();
      },
      onError: (error) => {
        console.error('Error canceling signature:', error);
      },
    });
  };

  const sender = tourCalculationSignatures?.find((s) => s.signatureRole === 'SENDER');
  const receivers = tourCalculationSignatures?.filter((s) => s.signatureRole === 'RECEIVER');
  const hasUnsignedSender =
    tourCalculationSignatures?.some(
      (signature) => signature.signatureRole === 'SENDER' && !signature.isSigned,
    ) ?? false;

  const isTourCalculationPrivate = receivers?.length === 0;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={toggleExpand} hitSlop={14}>
            <VinaupArrowWithTail
              width={14}
              height={14}
              color={COLORS.teal700}
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            />
          </Pressable>
          <View style={styles.leftContent}>
            <Text style={styles.titleUnderline}>Ký tên</Text>
            <PressableOpacity onPress={onOpenSignatureInfoPopover} hitSlop={8}>
              <Ionicons
                name="information-circle-sharp"
                size={ICON_SIZES.lg}
                color={COLORS.yellow400}
              />
            </PressableOpacity>
            <Button
              style={styles.logButton}
              onPress={handleOpenCancelLogModal}
              disabled={!calculationId}
            >
              <Text style={styles.logButtonText}>Nhật ký</Text>
            </Button>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isTourCalculationPrivate && <Text style={styles.statusLabel}>Chỉ bạn nhìn thấy</Text>}
          <PressableOpacity
            onPress={handleOpenSignerSelectModal}
            disabled={isLoading || isManagingReceiverSignatures}
          >
            <Feather name={'user-plus'} size={ICON_SIZES.lg} color={COLORS.teal700} />
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
              isAllowToCancel={!!sender?.isSigned && sender?.signedByUserId === currentUser?.id}
              role="SENDER"
              isLoading={isLoading || isSigningTourCalculation || isCancelingTourCalculation}
              alignment="left"
              onSign={() => handleOpenSignConfirmSlideSheet(sender?.id, true)}
              onCancel={() => handleOpenCancelConfirmSlideSheet(sender?.id)}
            />
            <Text style={styles.nameText}>{sender?.targetUser?.name}</Text>
            {sender?.isSigned && (
              <Text style={styles.timeText}>
                {dayjs(sender.signedAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            )}
          </View>

          <View style={styles.signatureColumnRight}>
            <Text style={styles.roleText}>Người nhận</Text>
            {receivers?.map((receiver, index) => (
              <View key={receiver.id}>
                <SignatureEntity
                  isSigned={receiver.isSigned}
                  isAllowToSign={
                    !receiver.isSigned &&
                    !hasUnsignedSender &&
                    receiver.targetUserId === currentUser?.id
                  }
                  isAllowToCancel={
                    !!receiver.isSigned && receiver.signedByUserId === currentUser?.id
                  }
                  role="RECEIVER"
                  isLoading={isLoading || isSigningTourCalculation || isCancelingTourCalculation}
                  alignment="right"
                  onSign={() => handleOpenSignConfirmSlideSheet(receiver?.id, !hasUnsignedSender)}
                  onCancel={() => handleOpenCancelConfirmSlideSheet(receiver?.id)}
                />
                <Text style={styles.nameText}>{receiver?.targetUser?.name}</Text>
                {receiver.isSigned && (
                  <View style={styles.signatureInfo}>
                    <Text style={styles.timeText}>
                      {dayjs(receiver.signedAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </View>
                )}
                {receivers.length > 1 && index < receivers.length - 1 && (
                  <Text style={styles.divider}>---</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
      <SignerSelectModal
        modalRef={modalRef}
        organizationMembers={organizationMembers?.filter(
          (member) => member.user?.id !== sender?.targetUserId,
        )}
        isLoading={isLoading || isManagingReceiverSignatures}
        onConfirm={handleConfirmSelectedOrganizationMembers}
        receiverSignatures={receivers}
      />
      <ConfirmSlideSheet
        ref={signConfirmSlideSheetRef}
        title="Xác nhận ký tên"
        confirmText="Xác nhận"
        cancelText="Huỷ"
        isLoading={isSigningTourCalculation}
        onCloseCompleted={() => setSelectedSignatureId(null)}
        onConfirmPress={handleConfirmSignTourCalculation}
      />
      <ConfirmSlideSheet
        ref={cancelConfirmSlideSheetRef}
        title="Xác nhận huỷ ký"
        confirmText="Huỷ ký"
        cancelText="Đóng"
        isLoading={isCancelingTourCalculation}
        onCloseCompleted={() => setSelectedSignatureId(null)}
        onConfirmPress={handleConfirmCancelTourCalculation}
      />
      <TourCalculationCancelLogModal modalRef={cancelLogModalRef} />
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
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  titleUnderline: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
  logButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  logButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.medium,
  },
  iconLock: {
    marginRight: SPACING.xs,
  },
  statusLabel: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    color: COLORS.red600,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginTop: SPACING['2xs'],
  },
  nameText: {
    fontSize: FONT_SIZES.sm,
  },
  signatureInfo: {
    alignItems: 'flex-end',
  },
  divider: {
    textAlign: 'right',
    marginVertical: SPACING.xs,
    fontSize: FONT_SIZES.xs,
  },
});
