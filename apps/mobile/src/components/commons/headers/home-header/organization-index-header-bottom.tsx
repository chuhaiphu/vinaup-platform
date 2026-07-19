import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useOrganizationContext } from '@/providers/auth/organization-provider';

const OrganizationIndexHeaderBottom = () => {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const { organizations } = useOrganizationContext();
  const currentOrg = organizations.find((org) => org.id === organizationId);

  return (
    <View style={styles.bottomContainer}>
      <Text style={styles.text}>
        Thành viên <Text style={styles.count}>{currentOrg?.memberCount ?? 0}</Text>
      </Text>
      <Text style={styles.text}>
        Liên kết <Text style={styles.count}>{currentOrg?.memberLinkedCount ?? 0}</Text> tài khoản
      </Text>
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
  text: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal900,
  },
  count: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default OrganizationIndexHeaderBottom;
