import { useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';

import { getCarById } from '@/apis/car/car-apis';
import { Popover } from '@/components/primitives/popover';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { CarResponse } from '@/interfaces/car-interfaces';

export interface ExpiringCarContent {
  car: CarResponse;
  expiringFields: {
    label: string;
    status: string;
    isOverdue: boolean;
  }[];
}

interface CarExpiryPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  contents: ExpiringCarContent[];
}

export function CarExpiryPopover({ isVisible, onClose, contents }: CarExpiryPopoverProps) {
  const maxScrollViewHeight = Dimensions.get('window').height * 0.4;
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const navigateToCarDetail = async (id?: string) => {
    if (!id) return;
    onClose();
    setIsNavigating(true);
    try {
      await prefetch(() => getCarById(id), { fetchKey: `organization-car-${id}` });
    } catch {
      // Fallback to normal navigation if prefetch fails.
    }
    router.push({
      pathname: '/(protected)/car-detail/[carId]',
      params: { carId: id },
    });
    setIsNavigating(false);
  };

  return (
    <>
      {isVisible && <View style={styles.backdrop} />}
      <Popover
        isVisible={isVisible}
        onClose={onClose}
        variant="warning"
        title="Cảnh báo thời hạn xe"
        position={{ top: 120, left: 16, right: 16 }}
        style={{ container: styles.popoverContainer }}
      >
        <View style={styles.container}>
          <Text style={styles.subtitle}>{contents.length} xe có hạng mục sắp hoặc đã hết hạn.</Text>

          <ScrollView style={{ maxHeight: maxScrollViewHeight }} showsVerticalScrollIndicator>
            {contents.map(({ car, expiringFields }) => (
              <View key={car.id} style={styles.carItem}>
                <PressableOpacity onPress={() => navigateToCarDetail(car.id)}>
                  <Text style={styles.carName}>
                    {car.name ?? 'Xe chưa đặt tên'}
                    {car.manufacturer ? ` (${car.manufacturer})` : ''}
                  </Text>
                </PressableOpacity>
                {expiringFields.map((field, idx) => (
                  <View key={idx} style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={[styles.fieldStatus, field.isOverdue && styles.overdueText]}>
                      {field.status}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <PressableOpacity style={styles.confirmButton} onPress={onClose}>
            <Text style={styles.confirmButtonText}>Đã hiểu</Text>
          </PressableOpacity>
        </View>
      </Popover>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 999,
  },
  // Layout-only override: keep this popover's rounded corners and padding.
  // Background / border colors are owned by the "warning" variant.
  popoverContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  container: {
    marginTop: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  carItem: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray150,
  },
  carName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.blue600,
    marginBottom: SPACING.xs,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING['2xs'],
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  fieldStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.orange500,
  },
  overdueText: {
    color: COLORS.red600,
  },
  confirmButton: {
    backgroundColor: COLORS.teal700,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
