import MaterialIcons from '@react-native-vector-icons/material-icons/static';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupVerticalHalfArrow from '@/components/icons/vinaup-vertical-half-arrow.native';
import { Avatar } from '@/components/primitives/avatar';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { SingleSelect, SingleSelectOption } from '@/components/primitives/single-select';
import { SlideSheet, SlideSheetRef } from '@/components/primitives/slide-sheet';
import {
  AVATAR_SIZES,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  ICON_SIZES,
  SPACING,
} from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { useOrganizationContext } from '@/providers/auth/organization-provider';

export const OwnerSelector = () => {
  const router = useRouter();
  const { organizationId: currentOrgId } = useLocalSearchParams<{
    organizationId: string;
  }>();
  const { currentUser } = useAuthContext();
  const { organizations } = useOrganizationContext();
  const sheetRef = useRef<SlideSheetRef>(null);
  const insets = useSafeAreaInsets();

  const isOrganizationMode = !!currentOrgId;

  const getSortedOwners = () => {
    if (!currentUser) return [];
    // If the current owner is personal(main user), place user on top of the list
    if (!isOrganizationMode) {
      return [currentUser, ...organizations];
    }

    // If the current owner is organization,
    // place the active organization on top, then the user, then the rest of organizations
    const activeOrg = organizations.find((org) => org.id === currentOrgId);
    const otherOrgs = organizations.filter((org) => org.id !== activeOrg?.id);
    return [activeOrg, currentUser, ...otherOrgs];
  };

  const getCurrentValue = () => {
    if (!isOrganizationMode) return 'personal';
    return `organization-${currentOrgId}`;
  };
  const profileOptions: SingleSelectOption[] = getSortedOwners().map((owner) => {
    if (!owner) return { label: null, value: null };
    const isMainUser = owner.id === currentUser?.id;

    return {
      label: owner.name,
      value: isMainUser ? 'personal' : `organization-${owner.id}`,
      leftSection: (
        <Avatar
          imgSrc={owner.avatarUrl}
          size={AVATAR_SIZES.sm}
          icon={
            isMainUser ? undefined : (
              <MaterialIcons name="groups" size={ICON_SIZES.lg} color={COLORS.teal700} />
            )
          }
        />
      ),
    };
  });

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === getCurrentValue()) return;
    // Show the navigating loader during the gap between the sheet closing and the
    // new owner route mounting. The useEffect above clears it on route resolve.
    if (selectedValue === 'personal') {
      router.replace('/personal');
    } else if (selectedValue.startsWith('organization')) {
      // remove the 'organization-' prefix and join the rest with '-'
      const orgId = selectedValue.split('-').slice(1).join('-');
      router.replace(`/organization/${orgId}`);
    }
  };

  return (
    <>
      <PressableOpacity style={styles.trigger} onPress={() => sheetRef.current?.open()}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {profileOptions.find((o) => o.value === getCurrentValue())?.label}
        </Text>
        <VinaupVerticalHalfArrow width={14} height={14} color={COLORS.teal700} />
      </PressableOpacity>
      <SlideSheet ref={sheetRef}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Chủ thể</Text>
        </View>
        <SingleSelect
          options={profileOptions}
          value={getCurrentValue()}
          onSelectOption={(val) => {
            sheetRef.current?.close(() => handleValueChange(val));
          }}
        />
        <View style={{ height: insets.bottom }} />
      </SlideSheet>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  triggerText: {
    color: COLORS.teal700,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
  },
  sheetHeader: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
    alignItems: 'center',
  },
  sheetHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal900,
  },
});
