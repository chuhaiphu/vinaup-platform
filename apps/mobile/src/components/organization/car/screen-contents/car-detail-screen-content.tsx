import DeleteIcon from '@expo/material-symbols/delete.xml';
import { PERMISSION_ACTION, PERMISSION_RESOURCE } from '@vinaup-platform/permission';
import { Stack } from 'expo-router';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { CarAdditionalImagesSection } from '@/components/organization/car/detail/car-additional-images-section';
import { CarAssignmentSection } from '@/components/organization/car/detail/car-assignment-section';
import { CarDescriptionSection } from '@/components/organization/car/detail/car-description-section';
import { CarDetailHeader } from '@/components/organization/car/detail/car-detail-header';
import { CarExpirySection } from '@/components/organization/car/detail/car-expiry-section';
import { CarFuelDepreciationSection } from '@/components/organization/car/detail/car-fuel-depreciation-section';
import { CarMaintenanceLogSection } from '@/components/organization/car/detail/car-maintenance-log-section';
import { CarStatusBar } from '@/components/organization/car/detail/car-status-bar';
import { COLORS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import type { ToolbarIcon } from '@/interfaces/navigation-interfaces';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';
import { useOrganizationAbility } from '@/providers/organization/organization-ability-provider';

export function CarDetailScreenContent() {
  const { isRefreshingCar, isDeletingCar, refreshCar, handleDelete } = useCarDetailContext();
  const { can } = useOrganizationAbility();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const handleDeleteCar = () =>
    handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );

  return (
    <View style={styles.container}>
      {can(PERMISSION_ACTION.DELETE, PERMISSION_RESOURCE.CAR) && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Platform.select<ToolbarIcon>({ ios: 'trash', android: DeleteIcon })}
            accessibilityLabel="Xoá"
            disabled={isDeletingCar}
            onPress={handleDeleteCar}
          />
        </Stack.Toolbar>
      )}
      {/* Status bar sits above the header card and stays fixed while the detail scrolls. */}
      <CarStatusBar />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingCar}
            onRefresh={refreshCar}
            colors={[COLORS.teal700]}
            tintColor={COLORS.teal700}
          />
        }
      >
        <CarDetailHeader />
        <CarAdditionalImagesSection />
        <CarDescriptionSection />
        <CarFuelDepreciationSection />
        <CarExpirySection />
        <CarAssignmentSection />
      </ScrollView>
      {/* Pinned at the bottom so the maintenance-log entry is always reachable while the detail scrolls. */}
      <CarMaintenanceLogSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.sm,
  },
});
