import { useRouter } from 'expo-router';
import { Text, View, Button, StyleSheet } from 'react-native';

import { OwnerSelector } from '@/components/commons/selectors/owner-selector/owner-selector';
import VinaupPlusMinusMultiplyEqual from '@/components/icons/vinaup-plus-minus-multiply-equal.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

export function OrganizationProfileScreenContent() {
  const { performLogout } = useAuthContext();
  const { organizationId } = useOrganizationAbility();
  const router = useRouter();

  const handleLogout = () => {
    performLogout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.ownerSection}>
        <Text style={styles.sectionTitle}>Chủ thể</Text>
        <OwnerSelector organizationId={organizationId} />
      </View>

      <View style={styles.utilitySection}>
        <Text style={styles.sectionTitle}>Tiện ích</Text>
        <PressableOpacity
          style={styles.utilityCard}
          onPress={() =>
            router.navigate({
              pathname: '/(protected)/organization/[organizationId]/(tabs)/project',
              params: { organizationId },
            })
          }
        >
          <VinaupPlusMinusMultiplyEqual width={26} height={26} color={COLORS.teal700} />
          <Text style={styles.utilityText}>Dự án</Text>
        </PressableOpacity>
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
  utilitySection: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray600,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  utilityText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal700,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
