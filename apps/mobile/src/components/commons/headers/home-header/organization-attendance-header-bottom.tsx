import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';

const OrganizationAttendanceHeaderBottom = () => {
  return (
    <View style={styles.bottomContainer}>
      <View style={styles.leftContainer}>
        <Text style={styles.leftText}>Chấm</Text>
        <Text style={styles.leftSubtext}>công</Text>
      </View>
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
});

export default OrganizationAttendanceHeaderBottom;
