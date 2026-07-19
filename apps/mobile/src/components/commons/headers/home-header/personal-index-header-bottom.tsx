import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';

const PersonalIndexHeaderBottom = () => {
  const { currentUser } = useAuthContext();
  return (
    <View style={styles.bottomContainer}>
      <Text style={styles.text}>
        Sở hữu <Text style={styles.count}>{currentUser?.organizationOwnedCount ?? 0}</Text> tổ chức
      </Text>
      <Text style={styles.text}>
        Liên kết <Text style={styles.count}>{currentUser?.organizationLinkedCount ?? 0}</Text> tổ
        chức
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
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
    marginBottom: SPACING.sm,
  },
  count: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default PersonalIndexHeaderBottom;
