import Feather from '@react-native-vector-icons/feather/static';
import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { type ApiError } from 'fetchwire';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { VinaupPenLineOutline } from '@/components/icons/vinaup-pen-line-outline.native';
import { TourImplementationDriverCarEditModal } from '@/components/organization/tour/tour-implementation/modals/tour-implementation-driver-car-edit-modal/tour-implementation-driver-car-edit-modal';
import { DriverCarEditFormData } from '@/components/organization/tour/tour-implementation/modals/tour-implementation-driver-car-edit-modal/tour-implementation-driver-car-edit-modal-content';
import { TourImplementationTourGuideEditModal } from '@/components/organization/tour/tour-implementation/modals/tour-implementation-tour-guide-edit-modal/tour-implementation-tour-guide-edit-modal';
import { TourGuideEditFormData } from '@/components/organization/tour/tour-implementation/modals/tour-implementation-tour-guide-edit-modal/tour-implementation-tour-guide-edit-modal-content';
import { TourImplementationAssignmentConflictPopover } from '@/components/organization/tour/tour-implementation/popovers/tour-implementation-assignment-conflict-popover';
import { Avatar } from '@/components/primitives/avatar';
import { Button } from '@/components/primitives/button';
import { FieldsetView } from '@/components/primitives/fieldset-view';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import {
  ConflictingTour,
  TourImplementationAssignmentResponse,
  TourImplementationAssignmentWithMeta,
  UserAssignedTourImplementationResponse,
} from '@/interfaces/tour-implementation-interfaces';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

// Human-readable labels for tour-guide permission codes shown under the name.
const PERMISSION_LABELS: Record<string, string> = {
  BOOKING_READ: 'Booking',
  RECEIPT_PAYMENT_TOUR_READ: 'Dự toán HDV',
};

interface Props {
  assignments: TourImplementationAssignmentWithMeta[] | undefined;
  organizationId: string;
  // Ask the parent ScrollView to scroll to the bottom after the next content growth.
  onRequestScrollToEnd: () => void;
}

export function TourImplementationAssignmentSection({
  assignments,
  organizationId,
  onRequestScrollToEnd,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TourImplementationAssignmentResponse | null>(null);
  const [conflictingToursForPopover, setConflictingToursForPopover] = useState<
    ConflictingTour[] | null
  >(null);
  const tourGuideModalRef = useRef<SlideSheetRef>(null);
  const driverCarModalRef = useRef<SlideSheetRef>(null);

  const {
    createAssignment,
    isCreatingAssignment: isCreating,
    updateAssignment,
    updateUserAssigned,
    isUpdatingAssignment,
    deleteAssignment,
  } = useTourImplementationContext();

  const handleDeleteGroup = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn muốn xoá nhóm này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () =>
          deleteAssignment(id, {
            onError: (error: ApiError) =>
              Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xoá.')),
          }),
      },
    ]);
  };

  const handleAddGroup = () => {
    if (isCreating) return;
    // Flag the scroll now; it fires on the content-size change once the refetched
    // group has rendered (the add is async — no fixed timer can catch that moment).
    onRequestScrollToEnd();
    createAssignment({
      onError: (error: ApiError) =>
        Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra.')),
    });
  };

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    // Only scroll when opening: this section is last, so revealing it means going to end.
    if (next) onRequestScrollToEnd();
  };

  const handleConfirmTourGuide = (data: TourGuideEditFormData, closeModal: () => void) => {
    updateUserAssigned(
      {
        id: data.id,
        data: {
          currentOption: data.currentOption,
          customUserName: data.customUserName,
          customPhone: data.customPhone,
          userId: data.userId,
          permissions: data.permissions,
        },
      },
      {
        onSuccess: () => closeModal(),
        onError: (error: ApiError) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật.')),
      },
    );
  };

  const handleConfirmDriverCar = (data: DriverCarEditFormData, closeModal: () => void) => {
    // ─── persist car info, then the driver ─────
    updateAssignment(
      {
        id: data.assignmentId,
        data: { carName: data.carName, seatCount: data.seatCount },
      },
      {
        onSuccess: () =>
          updateUserAssigned(
            {
              id: data.driverUserAssignedId,
              data: {
                currentOption: data.currentOption,
                customUserName: data.customUserName,
                customPhone: data.customPhone,
                userId: data.userId,
                permissions: [],
              },
            },
            {
              onSuccess: () => closeModal(),
              onError: (error: ApiError) =>
                Alert.alert(
                  'Lỗi',
                  generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật tài xế.'),
                ),
            },
          ),
        onError: (error: ApiError) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi cập nhật xe.')),
      },
    );
  };

  const handleOpenTourGuideModal = (item: TourImplementationAssignmentResponse) => {
    setSelectedAssignment(item);
    tourGuideModalRef.current?.open();
  };

  const handleOpenDriverCarModal = (item: TourImplementationAssignmentResponse) => {
    setSelectedAssignment(item);
    driverCarModalRef.current?.open();
  };

  const renderUserRow = (
    user: UserAssignedTourImplementationResponse | undefined,
    permissions?: string[],
    conflictingTours?: ConflictingTour[],
  ) => {
    const name =
      user?.currentOption === 0
        ? user.customUserName || 'Chưa nhập tên'
        : user?.user?.name || 'Chưa nhập tên';
    const rawPhone = user?.currentOption === 0 ? user?.customPhone : user?.user?.phone;
    const phoneText = rawPhone ? `${rawPhone}` : '—';
    const avatarUrl = user?.user?.avatarUrl;
    const permissionText = (permissions ?? [])
      .map((permission) => PERMISSION_LABELS[permission] ?? permission)
      .join('; ');

    return (
      <View style={styles.memberRow}>
        <Avatar imgSrc={avatarUrl} size={AVATAR_SIZES.md} />
        <View style={styles.memberInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.memberName}>{name}</Text>
            {conflictingTours?.length ? (
              <PressableOpacity
                onPress={() => setConflictingToursForPopover(conflictingTours)}
                hitSlop={6}
              >
                <Ionicons name="warning" size={ICON_SIZES.md} color={COLORS.yellow400} />
              </PressableOpacity>
            ) : null}
          </View>
          <Text style={styles.memberPhone}>{phoneText}</Text>
          {permissionText ? <Text style={styles.permissionText}>{permissionText}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.headerTitle}>Hướng dẫn viên & Tài Xe</Text>
          <View style={styles.headerActions}>
            <Button onPress={handleAddGroup} hitSlop={4} isLoading={isCreating}>
              <Feather name="user-plus" size={ICON_SIZES.md} color={COLORS.teal700} />
            </Button>
            <PressableOpacity onPress={handleToggleExpand} hitSlop={4}>
              <View style={styles.expandToggle}>
                <FontAwesome
                  name={isExpanded ? 'caret-down' : 'caret-up'}
                  size={ICON_SIZES.lg}
                  color={COLORS.teal700}
                />
              </View>
            </PressableOpacity>
          </View>
        </View>
        <View style={[styles.section, !isExpanded && styles.sectionCollapsed]}>
          {isExpanded && (
            <View style={styles.sectionContent}>
              {assignments?.length ? (
                assignments.map((item) => {
                  const tourGuide = item.usersAssigned.find((u) => u.role === 'TOUR_GUIDE');
                  const driver = item.usersAssigned.find((u) => u.role === 'DRIVER');
                  const tourGuideConflictingTours = tourGuide?.userId
                    ? item.meta.conflictingToursByUserId[tourGuide.userId]
                    : undefined;
                  const driverConflictingTours = driver?.userId
                    ? item.meta.conflictingToursByUserId[driver.userId]
                    : undefined;
                  return (
                    <FieldsetView
                      key={item.id}
                      legendRight={
                        <PressableOpacity onPress={() => handleDeleteGroup(item.id)} hitSlop={6}>
                          <FontAwesome name="trash-o" size={ICON_SIZES.md} color={COLORS.red600} />
                        </PressableOpacity>
                      }
                      style={{
                        border: styles.groupCard,
                        legendRightContainer: styles.groupDeleteLegendContainer,
                      }}
                    >
                      <View style={styles.groupContainer}>
                        {/* Tour guide fieldset; edit pencil sits inside, centered right */}
                        <FieldsetView
                          legendLeft={<Text style={styles.legendText}>Hướng dẫn viên</Text>}
                        >
                          <View style={styles.fieldsetBody}>
                            <View style={styles.rowFill}>
                              {renderUserRow(
                                tourGuide,
                                tourGuide?.permissions,
                                tourGuideConflictingTours,
                              )}
                            </View>
                            <PressableOpacity
                              style={styles.editButton}
                              onPress={() => handleOpenTourGuideModal(item)}
                              hitSlop={6}
                            >
                              <VinaupPenLineOutline height={16} width={16} />
                            </PressableOpacity>
                          </View>
                        </FieldsetView>
                        {/* Driver + car grouped in one fieldset; single pencil centered right */}
                        <FieldsetView legendLeft={<Text style={styles.legendText}>Tài Xe</Text>}>
                          <View style={styles.fieldsetBody}>
                            <View style={styles.rowFill}>
                              {renderUserRow(driver, undefined, driverConflictingTours)}
                              <View style={styles.memberRow}>
                                <Avatar
                                  size={AVATAR_SIZES.md}
                                  icon={
                                    <Text style={styles.positionText}>
                                      {String(item.position).padStart(2, '0')}
                                    </Text>
                                  }
                                />
                                <View style={styles.memberInfo}>
                                  <Text style={styles.memberName}>
                                    {item.carName || 'Chưa có tên xe'}
                                  </Text>
                                  {item.seatCount != null ? (
                                    <Text style={styles.memberPhone}>{item.seatCount} chỗ</Text>
                                  ) : null}
                                </View>
                              </View>
                            </View>
                            <PressableOpacity
                              style={styles.editButton}
                              onPress={() => handleOpenDriverCarModal(item)}
                              hitSlop={6}
                            >
                              <VinaupPenLineOutline height={16} width={16} />
                            </PressableOpacity>
                          </View>
                        </FieldsetView>
                      </View>
                    </FieldsetView>
                  );
                })
              ) : (
                <Text style={styles.placeholderText}>Chưa có dữ liệu</Text>
              )}
            </View>
          )}
        </View>
      </View>
      <TourImplementationTourGuideEditModal
        modalRef={tourGuideModalRef}
        tourImplementationAssignment={selectedAssignment}
        organizationId={organizationId}
        isLoading={isUpdatingAssignment}
        onConfirm={handleConfirmTourGuide}
      />
      <TourImplementationDriverCarEditModal
        modalRef={driverCarModalRef}
        tourImplementationAssignment={selectedAssignment}
        organizationId={organizationId}
        isLoading={isUpdatingAssignment}
        onConfirm={handleConfirmDriverCar}
      />
      <TourImplementationAssignmentConflictPopover
        isVisible={!!conflictingToursForPopover}
        conflictingTours={conflictingToursForPopover ?? []}
        onClose={() => setConflictingToursForPopover(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.green50,
    padding: SPACING.sm,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  section: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    // boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  sectionCollapsed: {
    padding: 0,
  },
  sectionContent: {},
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  expandToggle: {},
  groupCard: {
    borderColor: COLORS.teal500,
    borderRadius: RADIUS.lg,
    // Explicit top/bottom (not paddingVertical) so this reliably overrides
    // FieldsetView's own paddingTop/paddingBottom edges.
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  groupDeleteLegendContainer: {
    top: -10,
  },
  groupContainer: {
    gap: SPACING.md,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  fieldsetBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowFill: {
    flex: 1,
  },
  editButton: {
    padding: SPACING.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  positionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.orange500,
    fontWeight: FONT_WEIGHTS.bold,
  },
  memberInfo: {
    flex: 1,
    marginLeft: SPACING['2xs'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
  },
  memberPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  infoBottom: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  permissionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
