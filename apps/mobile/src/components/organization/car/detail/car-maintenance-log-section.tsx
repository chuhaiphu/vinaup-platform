import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons/static';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VinaupLeftArrowBigHead from '@/components/icons/vinaup-left-arrow-big-head.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, ICON_SIZES, SPACING } from '@/constants/style-constants';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

export function CarMaintenanceLogSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { car } = useCarDetailContext();

  return (
    <PressableOpacity
      style={[styles.pin, { paddingBottom: insets.bottom + 10 }]}
      onPress={() =>
        router.push({
          pathname: '/(protected)/car-maintenance-log',
          params: { organizationId: car.organizationId, carId: car.id },
        })
      }
    >
      <View style={styles.pinLeft}>
        <MaterialCommunityIcons name="car-wrench" size={ICON_SIZES.md} color={COLORS.teal700} />
        <Text style={styles.pinText}>Nhật ký chi phí bảo trì</Text>
      </View>
      <VinaupLeftArrowBigHead width={16} height={16} />
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.gray300,
    backgroundColor: COLORS.white,
  },
  pinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pinText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});
