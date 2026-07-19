import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useFetchFn } from 'fetchwire';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { getCarsByOrganizationId } from '@/apis/car/car-apis';
import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { CarMemberSelectModal } from '@/components/commons/modals/car-member-select-modal/car-member-select-modal';
import { CarSelectModal } from '@/components/commons/modals/car-select-modal/car-select-modal';
import VinaupUserEdit from '@/components/icons/vinaup-user-edit.native';
import VinaupVanPlus from '@/components/icons/vinaup-van-plus.native';
import VinaupVan from '@/components/icons/vinaup-van.native';
import { TripAssignmentConflictPopover } from '@/components/organization/trip/popovers/trip-assignment-conflict-popover';
import { Avatar } from '@/components/primitives/avatar';
import { Button } from '@/components/primitives/button';
import { FieldsetView } from '@/components/primitives/fieldset-view';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { CarResponse } from '@/interfaces/car-interfaces';
import { ConflictingTrip, TripAssignmentWithMeta } from '@/interfaces/trip-interfaces';
import { useTripAssignmentListContext } from '@/providers/organization/trip/trip-assignment-list-provider';

export interface TripAssignmentSectionRef {
  refresh: () => void;
}

interface Props {
  organizationId: string | undefined;
  ref?: React.Ref<TripAssignmentSectionRef>;
}

export function TripAssignmentSection({ organizationId, ref }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTripAssignment, setSelectedTripAssignment] =
    useState<TripAssignmentWithMeta | null>(null);
  const [conflictingTripsForPopover, setConflictingTripsForPopover] = useState<
    ConflictingTrip[] | null
  >(null);
  const carModalRef = useRef<SlideSheetRef>(null);
  const memberModalRef = useRef<SlideSheetRef>(null);

  const {
    tripAssignments,
    isCreatingTripAssignment,
    isUpdatingTripAssignment,
    handleCreateTripAssignment,
    handleUpdateTripAssignment,
    handleDeleteTripAssignment,
    refreshFetch,
  } = useTripAssignmentListContext();

  useImperativeHandle(ref, () => ({ refresh: refreshFetch }), [refreshFetch]);

  const {
    data: cars,
    executeFetchFn: fetchCars,
    isLoading: isLoadingCars,
  } = useFetchFn(() => getCarsByOrganizationId(organizationId!), {
    fetchKey: `organization-car-list-${organizationId}`,
    tags: [FETCH_TAG.carList],
  });

  const {
    data: organizationMembers,
    executeFetchFn: fetchMembers,
    isLoading: isLoadingMembers,
  } = useFetchFn(() => getOrganizationMembersByOrganizationId(organizationId!), {
    fetchKey: `organization-members-${organizationId}`,
    tags: [FETCH_TAG.memberList],
  });

  const handleOpenCarModal = (tripAssignment: TripAssignmentWithMeta) => {
    if (!organizationId) return;
    fetchCars();
    setSelectedTripAssignment(tripAssignment);
    carModalRef.current?.open();
  };

  const handleOpenMemberModal = (tripAssignment: TripAssignmentWithMeta) => {
    if (!organizationId) return;
    fetchMembers();
    setSelectedTripAssignment(tripAssignment);
    memberModalRef.current?.open();
  };

  const handleSelectCar = (car: CarResponse) => {
    if (!selectedTripAssignment) return;
    handleUpdateTripAssignment(selectedTripAssignment.id, { carId: car.id });
  };

  const handleConfirmMembers = (selectedOrgMemberIds: string[], closeModal: () => void) => {
    if (!selectedTripAssignment) return;
    handleUpdateTripAssignment(
      selectedTripAssignment.id,
      { organizationMemberIds: selectedOrgMemberIds },
      closeModal,
    );
  };

  const handleDeleteGroup = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn muốn xoá phân công này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => handleDeleteTripAssignment(id) },
    ]);
  };

  const renderTripAssignmentCar = (tripAssignment: TripAssignmentWithMeta) => {
    const car = tripAssignment.car;
    const carConflictingTrips = tripAssignment.meta.carConflictingTrips;

    return (
      <FieldsetView legendLeft={<Text style={styles.legendText}>Xe</Text>}>
        <View style={styles.assignmentRow}>
          <Avatar
            size={AVATAR_SIZES.md}
            imgSrc={car?.featureImageUrl}
            icon={<VinaupVan width={22} height={22} color={COLORS.teal700} />}
          />
          <View style={styles.assignmentInfo}>
            <View style={styles.titleRow}>
              <PressableOpacity
                style={styles.carNamePressable}
                onPress={() => handleOpenCarModal(tripAssignment)}
              >
                <Text style={styles.assignmentTitle} numberOfLines={1}>
                  {car ? car.name || 'Chưa có tên xe' : 'Chưa chọn xe'}
                  {car?.manufacturer ? ` - ${car.manufacturer}` : ''}
                </Text>
                <FontAwesome6
                  iconStyle="solid"
                  name="caret-down"
                  size={ICON_SIZES.sm}
                  color={COLORS.teal700}
                />
              </PressableOpacity>
              {carConflictingTrips.length > 0 && (
                <PressableOpacity
                  onPress={() => setConflictingTripsForPopover(carConflictingTrips)}
                  hitSlop={6}
                >
                  <Ionicons name="warning" size={ICON_SIZES.md} color={COLORS.yellow400} />
                </PressableOpacity>
              )}
            </View>
            {car ? (
              <Text style={styles.assignmentSubtitle}>
                {[
                  car.model ? `Đời ${car.model}` : null,
                  car.category,
                  car.seatCount != null ? `${car.seatCount} chỗ` : null,
                ]
                  .filter(Boolean)
                  .join(' - ')}
              </Text>
            ) : null}
          </View>
        </View>
      </FieldsetView>
    );
  };

  const renderTripAssignmentMembers = (tripAssignment: TripAssignmentWithMeta) => {
    return (
      <FieldsetView
        legendLeft={<Text style={styles.legendText}>Tài xế</Text>}
        legendRight={
          <PressableOpacity onPress={() => handleOpenMemberModal(tripAssignment)} hitSlop={6}>
            <VinaupUserEdit width={18} height={18} color={COLORS.teal700} />
          </PressableOpacity>
        }
      >
        {tripAssignment.members.length === 0 ? (
          <View style={styles.assignmentRow}>
            <Text style={styles.placeholderText}>Chưa phân công tài xế</Text>
          </View>
        ) : (
          tripAssignment.members.map((member) => {
            const memberConflictingTrips =
              tripAssignment.meta.conflictingTripsByMemberId[member.organizationMemberId];

            return (
              <View key={member.id} style={styles.assignmentRow}>
                <Avatar imgSrc={member.organizationMember?.avatarUrl} size={AVATAR_SIZES.md} />
                <View style={styles.assignmentInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.assignmentTitle} numberOfLines={1}>
                      {member.organizationMember?.name}
                    </Text>
                    {memberConflictingTrips?.length ? (
                      <PressableOpacity
                        onPress={() => setConflictingTripsForPopover(memberConflictingTrips)}
                        hitSlop={6}
                      >
                        <Ionicons name="warning" size={ICON_SIZES.md} color={COLORS.yellow400} />
                      </PressableOpacity>
                    ) : null}
                  </View>
                  <Text style={styles.assignmentSubtitle}>
                    {member.organizationMember?.phone || '—'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </FieldsetView>
    );
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.headerTitle}>Phân công chuyến xe</Text>
          <View style={styles.headerActions}>
            <Button
              onPress={() => handleCreateTripAssignment()}
              hitSlop={4}
              isLoading={isCreatingTripAssignment}
            >
              <VinaupVanPlus width={28} height={28} color={COLORS.teal700} />
            </Button>
            <PressableOpacity onPress={() => setIsExpanded(!isExpanded)} hitSlop={4}>
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
              {tripAssignments.length ? (
                tripAssignments.map((tripAssignment) => (
                  <FieldsetView
                    key={tripAssignment.id}
                    legendRight={
                      <PressableOpacity
                        onPress={() => handleDeleteGroup(tripAssignment.id)}
                        hitSlop={6}
                      >
                        <FontAwesome name="trash-o" size={ICON_SIZES.md} color={COLORS.red600} />
                      </PressableOpacity>
                    }
                    style={{
                      border: styles.groupCard,
                      legendRightContainer: styles.groupDeleteLegendContainer,
                    }}
                  >
                    <View style={styles.groupContainer}>
                      {renderTripAssignmentCar(tripAssignment)}
                      {renderTripAssignmentMembers(tripAssignment)}
                    </View>
                  </FieldsetView>
                ))
              ) : (
                <Text style={styles.placeholderText}>Chưa có phân công</Text>
              )}
            </View>
          )}
        </View>
      </View>
      <CarSelectModal
        modalRef={carModalRef}
        cars={cars}
        selectedCarId={selectedTripAssignment?.carId}
        isLoading={isLoadingCars ?? false}
        onSelect={handleSelectCar}
      />
      <CarMemberSelectModal
        modalRef={memberModalRef}
        organizationMembers={organizationMembers}
        preSelectedMemberIds={selectedTripAssignment?.members.map(
          (member) => member.organizationMemberId,
        )}
        isLoading={(isLoadingMembers ?? false) || isUpdatingTripAssignment}
        onConfirm={handleConfirmMembers}
      />
      <TripAssignmentConflictPopover
        isVisible={!!conflictingTripsForPopover}
        conflictingTrips={conflictingTripsForPopover ?? []}
        onClose={() => setConflictingTripsForPopover(null)}
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
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
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
  // Shared offset for icon-only legends (trash-o delete, driver-edit pencil) —
  // icons need a slightly deeper cutout than the default text legend baseline.
  groupContainer: {
    gap: SPACING.md,
  },
  groupDeleteLegendContainer: {
    top: -10,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  assignmentInfo: {
    flex: 1,
    marginLeft: SPACING['2xs'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  carNamePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 1,
  },
  assignmentTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.bold,
    flexShrink: 1,
  },
  assignmentSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray900,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
