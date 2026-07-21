import Ionicons from '@react-native-vector-icons/ionicons/static';
import { TOUR_ASSIGNMENT_PERMISSION } from '@vinaup-platform/permission';
import { useFetchFn } from 'fetchwire';
import { useEffect, useImperativeHandle, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import { getOrganizationMembersByOrganizationId } from '@/apis/organization/organization-member-apis';
import { searchUsers } from '@/apis/user/user-apis';
import VinaupDoubleCheck from '@/components/icons/vinaup-double-check.native';
import { Avatar } from '@/components/primitives/avatar';
import { ConfirmSlideSheetContentRef } from '@/components/primitives/confirm-slide-sheet/confirm-slide-sheet';
import { FlatTextInput } from '@/components/primitives/flat-text-input';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
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
import { TourImplementationAssignmentResponse } from '@/interfaces/tour-implementation-interfaces';

type TourGuideInputMode = 'manual' | 'search';

const MODE_ITEMS: SegmentedControlItem<TourGuideInputMode>[] = [
  { value: 'manual', label: 'Nhập tay' },
  { value: 'search', label: 'Tìm kiếm' },
];

const MODE_TO_OPTION: Record<TourGuideInputMode, number> = { manual: 0, search: 1 };

export interface TourGuideEditFormData {
  id: string;
  currentOption: number;
  customUserName: string | null;
  customPhone: string | null;
  userId: string | null;
  permissions: string[];
}

interface Props {
  tourImplementationAssignment: TourImplementationAssignmentResponse;
  organizationId: string;
  isLoading?: boolean;
  onSubmit?: (data: TourGuideEditFormData) => void;
  ref?: React.RefObject<ConfirmSlideSheetContentRef | null>;
}

export function TourImplementationTourGuideEditModalContent({
  tourImplementationAssignment,
  organizationId,
  isLoading = false,
  onSubmit,
  ref,
}: Props) {
  const tourGuide = tourImplementationAssignment.usersAssigned.find((u) => u.role === 'TOUR_GUIDE');

  const [mode, setMode] = useState<TourGuideInputMode>(
    tourGuide?.currentOption === 1 ? 'search' : 'manual',
  );

  // Manual entry state
  const [name, setName] = useState(tourGuide?.customUserName ?? '');
  const [phone, setPhone] = useState(tourGuide?.customPhone ?? '');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(tourGuide?.user?.id ?? null);

  // Permissions granted to the picked tour guide (search mode only).
  const [permissions, setPermissions] = useState<string[]>(tourGuide?.permissions ?? []);

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  // ─── all members of the organization (default list) ─────
  const {
    data: organizationMembers,
    executeFetchFn: fetchMembers,
    isLoading: isLoadingMembers,
  } = useFetchFn(() => getOrganizationMembersByOrganizationId(organizationId), {
    fetchKey: `tour-guide-org-members-${organizationId}`,
    tags: [FETCH_TAG.memberList],
  });

  // ─── single member from exact phone lookup across all users ─────
  const {
    data: usersResult,
    executeFetchFn: searchUsersByPhone,
    isLoading: isSearching,
  } = useFetchFn(() => searchUsers({ phone: searchQuery.trim() }), {
    // ─── Include the phone in the key, NOT just a static id ─────
    // fetchwire caches the resolved promise by fetchKey.
    // keying by the query gives each phone its own cache entry so new searches actually refetch.
    fetchKey: `tour-guide-user-phone-search-${tourImplementationAssignment.id}-${searchQuery.trim()}`,
    tags: [],
  });

  useEffect(() => {
    if (organizationId) fetchMembers();
  }, [organizationId, fetchMembers]);

  // Fire the phone search only after the user stops typing to avoid a request per keystroke.
  const performSearch = useDebouncedCallback((query: string) => {
    if (query.trim().length === 0) return;
    searchUsersByPhone();
  }, 400);

  const isSearchQueryRemain = searchQuery.trim().length > 0;

  const options = (() => {
    // Case 1: show the user matches exact phone number.
    if (isSearchQueryRemain) {
      return (usersResult ?? []).map((user) => ({
        userId: user.id,
        name: user.name ?? '',
        phone: user.phone ?? '',
        avatarUrl: user.avatarUrl,
      }));
    }

    // Case 2: no search query → show org members that have a linked account.
    const memberOptions = (organizationMembers ?? [])
      .filter((member) => member.userId)
      .map((member) => ({
        userId: member.userId as string,
        name: member.name,
        phone: member.phone,
        avatarUrl: member.avatarUrl,
      }));

    // Case 2a: if the currently selected tour guide isn't an org member
    // prepend it to the top of the selection list
    const currentUser = tourGuide?.user;
    if (currentUser && !memberOptions.some((o) => o.userId === currentUser.id)) {
      return [
        {
          userId: currentUser.id,
          name: currentUser.name ?? '',
          phone: currentUser.phone ?? '',
          avatarUrl: currentUser.avatarUrl,
        },
        ...memberOptions,
      ];
    }
    return memberOptions;
  })();

  const selectOptions: SingleSelectOption[] = options.map((o) => ({
    value: o.userId,
    label: o.name || 'Chưa có tên',
  }));

  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);
    performSearch(text);
  };

  const handleConfirm = () => {
    Keyboard.dismiss();
    if (!tourGuide) return;

    onSubmit?.({
      id: tourGuide.id,
      currentOption: MODE_TO_OPTION[mode],
      customUserName: mode === 'manual' ? name || null : null,
      customPhone: mode === 'manual' ? phone || null : null,
      userId: mode === 'search' ? selectedUserId : null,
      permissions,
    });
  };

  useImperativeHandle(ref, () => ({ submit: handleConfirm }));

  const isListLoading = isSearchQueryRemain ? isSearching : isLoadingMembers;

  return (
    <View style={styles.container}>
      <SegmentedControl
        items={MODE_ITEMS}
        value={mode}
        onChange={setMode}
        style={{
          pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
        }}
      />

      {mode === 'manual' ? (
        <View style={styles.manualContent}>
          <FlatTextInput
            label="Tên hướng dẫn viên"
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên"
            editable={!isLoading}
          />
          <FlatTextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
      ) : (
        <View style={styles.searchContent}>
          <View style={styles.permissionsRow}>
            <PressableOpacity
              style={styles.permissionItem}
              onPress={() =>
                togglePermission(TOUR_ASSIGNMENT_PERMISSION.RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ)
              }
            >
              <Text style={styles.permissionLabel}>Xem Dự toán HDV</Text>
              <View
                style={[
                  styles.checkbox,
                  permissions.includes(
                    TOUR_ASSIGNMENT_PERMISSION.RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ,
                  ) && styles.checkboxChecked,
                ]}
              >
                {permissions.includes(
                  TOUR_ASSIGNMENT_PERMISSION.RECEIPT_PAYMENT_FOR_TOUR_GUIDE_READ,
                ) && <VinaupDoubleCheck color={COLORS.orange500} />}
              </View>
            </PressableOpacity>
          </View>

          <View style={styles.searchBar}>
            {isListLoading ? (
              <ActivityIndicator size="small" color={COLORS.teal700} />
            ) : (
              <Ionicons name="search" size={ICON_SIZES.md} color={COLORS.teal700} />
            )}
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchTextChange}
              placeholder="Số điện thoại"
              placeholderTextColor={COLORS.gray400}
              style={styles.searchInput}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.listArea}>
            {options.length === 0 ? (
              <Text style={styles.emptyText}>
                {isSearchQueryRemain
                  ? 'Không tìm thấy thành viên khớp số điện thoại.'
                  : 'Không có thành viên nào.'}
              </Text>
            ) : (
              <SingleSelect
                options={selectOptions}
                value={selectedUserId ?? ''}
                onSelectOption={(value) => setSelectedUserId(value || null)}
                renderOption={(option, isSelected, select) => {
                  const user = options.find((o) => o.userId === option.value)!;
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        styles.optionRow,
                        (pressed || isSelected) && styles.optionRowActive,
                      ]}
                      onPress={select}
                      disabled={isLoading}
                    >
                      <Avatar imgSrc={user.avatarUrl} size={AVATAR_SIZES.md} />
                      <View style={styles.optionTextContainer}>
                        <Text style={styles.optionName} numberOfLines={1}>
                          {user.name || 'Chưa có tên'}
                        </Text>
                        <Text style={styles.optionPhone} numberOfLines={1}>
                          {user.phone || '—'}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'radio-button-on-sharp' : 'radio-button-off-sharp'}
                        size={ICON_SIZES.lg}
                        color={isSelected ? COLORS.teal700 : COLORS.gray300}
                      />
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  manualContent: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  searchContent: {
    flex: 1,
    marginTop: SPACING.lg,
  },
  permissionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  permissionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal700,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.orange300,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
    paddingVertical: 0,
  },
  listArea: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING['2xs'],
    minHeight: 60,
  },
  optionRowActive: {
    backgroundColor: '#F2FBFA',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionName: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal700,
    fontWeight: FONT_WEIGHTS.medium,
  },
  optionPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal900,
  },
  emptyText: {
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});
