import Ionicons from '@react-native-vector-icons/ionicons/static';
import { useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import VinaupDoubleCheck from '@/components/icons/vinaup-double-check.native';
import { Avatar } from '@/components/primitives/avatar';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { MultiSelect, MultiSelectProps } from '@/components/primitives/multi-select';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/style-constants';
import { OrganizationMemberResponse } from '@/interfaces/organization-member-interfaces';
import { MemberAssignedTourImplementationResponse } from '@/interfaces/tour-implementation-interfaces';

interface OrgMemSelectModalContentProps {
  isLoading?: boolean;
  organizationMembers?: OrganizationMemberResponse[] | null;
  membersAssigned?: MemberAssignedTourImplementationResponse[] | null;
  onSubmit?: (selectedOrgMemberIds: string[]) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function OrgMemSelectModalContent({
  isLoading,
  organizationMembers,
  membersAssigned,
  onSubmit,
  ref,
}: OrgMemSelectModalContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () =>
      (membersAssigned
        ?.map((m) => m.organizationMemberId)
        .filter((id) => id !== null && id !== undefined) as string[]) ?? [],
  );

  const protectedMemberIds = new Set(
    membersAssigned?.filter((m) => m.role === 'CREATOR').map((m) => m.organizationMemberId) ?? [],
  );

  const filteredMembers = organizationMembers?.filter(
    (member) =>
      !protectedMemberIds.has(member.id) &&
      (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery)),
  );

  const handleConfirm = () => {
    onSubmit?.(selectedIds);
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  const renderOption: MultiSelectProps['renderOption'] = (optionValue, optionContext) => {
    const member = organizationMembers?.find((m) => m?.id === optionValue);
    if (!member) return null;
    if (!member.user) return null;
    const isSelected = optionContext.isSelected;

    return (
      <Pressable style={styles.memberItem} onPress={optionContext.toggle}>
        <Avatar imgSrc={member.avatarUrl} size={AVATAR_SIZES.md} />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberDetail}>
            {member.phone}
            {member.address ? ` - ${member.address}` : ''}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <VinaupDoubleCheck color={COLORS.teal700} />}
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={ICON_SIZES.md} color={COLORS.teal700} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Nhập tên hoặc số điện thoại..."
          placeholderTextColor={COLORS.gray400}
          style={styles.searchInput}
        />
        {isLoading && <ActivityIndicator size="small" color={COLORS.teal700} />}
      </View>
      <MultiSelect
        options={
          filteredMembers?.map((member) => ({
            value: member?.id || '',
            label: member.name,
          })) || []
        }
        values={selectedIds}
        onOptionToggle={setSelectedIds}
        renderOption={renderOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    paddingVertical: 0,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  memberName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
    marginBottom: SPACING.xs,
  },
  memberDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.teal700,
  },
});
