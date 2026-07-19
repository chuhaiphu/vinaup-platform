import Feather from '@react-native-vector-icons/feather/static';
import FontAwesome from '@react-native-vector-icons/fontawesome/static';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { OrgMemSelectModal } from '@/components/commons/modals/organization-member-select-modal/org-mem-select-modal';
import { Avatar } from '@/components/primitives/avatar';
import { FieldsetView } from '@/components/primitives/fieldset-view';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';
import { useOrganizationMemberListContext } from '@/providers/organization/member/organization-member-list-provider';
import { useTourImplementationContext } from '@/providers/organization/tour/tour-implementation-provider';

export function TourImplementationMembersAssignedSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const memModalRef = useRef<SlideSheetRef>(null);

  const { tourImplementation, manageMembersAssigned, isUpdatingImplementation } =
    useTourImplementationContext();
  const {
    organizationMembers,
    fetchMembers,
    isLoading: isLoadingMembers,
  } = useOrganizationMemberListContext();

  const handleOpenModal = () => {
    fetchMembers();
    memModalRef.current?.open();
  };

  const handleConfirmMembers = (selectedOrgMemberIds: string[], onSuccessCallback?: () => void) => {
    manageMembersAssigned(selectedOrgMemberIds, {
      onError: () => Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật điều hành.'),
      onSuccess: () => {
        onSuccessCallback?.();
        memModalRef.current?.close();
      },
    });
  };

  return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.headerTitle}>Điều hành</Text>
          <View style={styles.headerActions}>
            <PressableOpacity onPress={handleOpenModal} hitSlop={4}>
              <Feather name="user-plus" size={ICON_SIZES.md} color={COLORS.teal700} />
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
              {tourImplementation.membersAssigned?.length ? (
                tourImplementation.membersAssigned.map((m) => {
                  const roleLabel =
                    m.role === 'CREATOR'
                      ? 'Người tạo'
                      : m.role === 'DIRECTOR'
                        ? 'Điều hành'
                        : 'Thành viên';
                  return (
                    <FieldsetView
                      key={m.id}
                      legendLeft={<Text style={styles.legendText}>{roleLabel}</Text>}
                    >
                      <View style={styles.memberRow}>
                        <Avatar imgSrc={m.organizationMember?.avatarUrl} size={AVATAR_SIZES.md} />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{m.organizationMember?.name}</Text>
                          <Text style={styles.memberPhone}>
                            {m.organizationMember?.phone || '—'}
                          </Text>
                        </View>
                      </View>
                    </FieldsetView>
                  );
                })
              ) : (
                <Text style={styles.placeholderText}>Chưa có nhân sự</Text>
              )}
            </View>
          )}
        </View>
      </View>
      <OrgMemSelectModal
        modalRef={memModalRef}
        organizationMembers={organizationMembers}
        membersAssigned={tourImplementation.membersAssigned}
        isLoading={isLoadingMembers || isUpdatingImplementation}
        onConfirm={handleConfirmMembers}
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
  sectionContent: {
    padding: SPACING.sm,
    gap: SPACING.md,
  },
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
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
    marginLeft: SPACING['2xs'],
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
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});
