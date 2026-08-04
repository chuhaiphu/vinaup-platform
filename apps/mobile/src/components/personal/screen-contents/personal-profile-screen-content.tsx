import { useRouter } from 'expo-router';
import { Text, View, Button, StyleSheet } from 'react-native';

import { OwnerSelector } from '@/components/commons/selectors/owner-selector/owner-selector';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';

export function PersonalProfileScreenContent() {
  const { performLogout } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    performLogout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.ownerSection}>
        <Text style={styles.sectionTitle}>Chủ thể</Text>
        <OwnerSelector />
      </View>
      <View style={styles.body}>
        <Button title="Đăng xuất" onPress={handleLogout} color="#ff4444" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ownerSection: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray300,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray600,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
