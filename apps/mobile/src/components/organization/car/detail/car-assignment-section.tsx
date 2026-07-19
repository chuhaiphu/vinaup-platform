import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import dayjs from 'dayjs';
import { useFetchFn } from 'fetchwire';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { CarMemberSelectModal } from '@/components/commons/modals/car-member-select-modal/car-member-select-modal';
import VinaupHistory from '@/components/icons/vinaup-history.native';
import VinaupUserEdit from '@/components/icons/vinaup-user-edit.native';
import { CarAssignmentHistoryModal } from '@/components/organization/car/modals/car-assignment-history-modal/car-assignment-history-modal';
import { CarAssignmentInfoPopover } from '@/components/organization/car/popovers/car-assignment-info-popover';
import { Avatar } from '@/components/primitives/avatar';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import { FETCH_TAG } from '@/constants/fetch-tag-constants';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

export function CarAssignmentSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isInfoPopoverVisible, setIsInfoPopoverVisible] = useState(false);
  const memberModalRef = useRef<SlideSheetRef>(null);
  const historyModalRef = useRef<SlideSheetRef>(null);

  const {
    car,
    handleAssignMembers,
    isAssigningMembers,
    assignmentHistory,
    isLoadingAssignmentHistory,
    fetchAssignmentHistory,
  } = useCarDetailContext();

  const {
    data: organizationMembers,
    executeFetchFn: fetchMembers,
    isLoading: isLoadingMembers,
  } = useFetchFn(() => getOrganizationMembersByOrganizationId(car.organizationId), {
    fetchKey: `organization-members-${car.organizationId}`,
    tags: [FETCH_TAG.memberList],
  });

  // ─── Active assignments drive both the displayed rows ─────
  // car.carAssignments is now current state only (active pairings), so no filtering.
  const activeAssignments = car.carAssignments ?? [];

  const preSelectedMemberIds = activeAssignments.map(
    (assignment) => assignment.organizationMemberId,
  );

  const handleOpenModal = () => {
    fetchMembers();
    memberModalRef.current?.open();
  };

  const handleOpenHistory = () => {
    fetchAssignmentHistory();
    historyModalRef.current?.open();
  };

  const handleConfirmMembers = (selectedMemberIds: string[], closeModal: () => void) => {
    handleAssignMembers(selectedMemberIds, closeModal);
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Ghép Tài xe</Text>
            <PressableOpacity onPress={() => setIsInfoPopoverVisible(true)} hitSlop={4}>
              <Ionicons
                name="information-circle-sharp"
                size={ICON_SIZES.md}
                color={COLORS.yellow400}
              />
            </PressableOpacity>
          </View>
          <View style={styles.headerActions}>
            <PressableOpacity onPress={handleOpenHistory} hitSlop={4}>
              <VinaupHistory width={18} height={18} color={COLORS.teal700} />
            </PressableOpacity>
            <PressableOpacity onPress={handleOpenModal} hitSlop={4}>
              <VinaupUserEdit width={18} height={18} color={COLORS.teal700} />
            </PressableOpacity>
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
        <View style={[styles.section, styles.sectionCollapsed]}>
          {isExpanded && (
            <View style={styles.sectionContent}>
              {activeAssignments.length ? (
                activeAssignments.map((assignment, index) => (
                  <View key={assignment.id}>
                    {index > 0 && <View style={styles.separator} />}
                    <View style={styles.memberRow}>
                      <Avatar
                        imgSrc={assignment.organizationMember?.avatarUrl}
                        size={AVATAR_SIZES.md}
                      />
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{assignment.organizationMember?.name}</Text>
                        <Text style={styles.memberPhone}>
                          {assignment.organizationMember?.phone || '—'}
                        </Text>
                        <Text style={styles.memberAssignedAt}>
                          Đã ghép từ {dayjs(assignment.startTime).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>Chưa ghép tài xe</Text>
              )}
            </View>
          )}
        </View>
      </View>
      <CarMemberSelectModal
        modalRef={memberModalRef}
        organizationMembers={organizationMembers}
        preSelectedMemberIds={preSelectedMemberIds}
        isLoading={(isLoadingMembers ?? false) || isAssigningMembers}
        onConfirm={handleConfirmMembers}
      />
      <CarAssignmentHistoryModal
        carName={car.name}
        events={assignmentHistory}
        isLoading={isLoadingAssignmentHistory}
        modalRef={historyModalRef}
      />
      <CarAssignmentInfoPopover
        isVisible={isInfoPopoverVisible}
        onClose={() => setIsInfoPopoverVisible(false)}
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
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',
  },
  sectionCollapsed: {
    padding: 0,
  },
  sectionContent: {
    padding: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  expandToggle: {},
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
    marginLeft: SPACING['2xs'],
    // 1px gap renders the hairline separator between stacked rows (token exception)
    gap: 1,
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
  memberAssignedAt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
