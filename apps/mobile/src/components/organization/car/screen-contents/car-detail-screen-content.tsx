import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

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
import { useScreenHeader } from '@/hooks/use-screen-header';
import { useCarDetailContext } from '@/providers/organization/car/car-detail-provider';

export function CarDetailScreenContent() {
  const { isRefreshingCar, isDeletingCar, refreshCar, handleDelete } = useCarDetailContext();
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const handleDeleteCar = () =>
    handleDelete(
      () => setIsNavigating(true),
      () => setIsNavigating(false),
    );

  const handleSaveAndExit = () => {
    refreshCar();
    router.back();
  };

  useScreenHeader({
    title: 'Chi tiết xe',
    onDelete: handleDeleteCar,
    onSave: handleSaveAndExit,
    isDeleting: isDeletingCar,
  });

  return (
    <View style={styles.container}>
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
