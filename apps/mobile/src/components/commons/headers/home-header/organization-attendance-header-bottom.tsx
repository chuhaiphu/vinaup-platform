import FontAwesome5 from '@react-native-vector-icons/fontawesome5/static';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

const OrganizationAttendanceHeaderBottom = () => {
  const router = useRouter();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const { can } = useOrganizationAbility();

  const canManageAttendanceConclusion = can(
    PERMISSION_ACTION.CREATE,
    PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION,
  );

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.leftContainer}>
        <Text style={styles.leftText}>Chấm</Text>
        <Text style={styles.leftSubtext}>công</Text>
      </View>
      {canManageAttendanceConclusion && (
        <PressableOpacity
          style={styles.manageTrigger}
          onPress={() =>
            router.push({
              pathname: '/(protected)/attendance-management',
              params: { organizationId },
            })
          }
        >
          <FontAwesome5
            iconStyle="solid"
            name="clipboard-check"
            size={ICON_SIZES.md}
            color={COLORS.teal700}
          />
          <Text style={styles.manageText}>Quản lý</Text>
        </PressableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  leftText: {
    fontSize: FONT_SIZES.lg,
  },
  leftSubtext: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal700,
  },
  manageTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  manageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default OrganizationAttendanceHeaderBottom;
