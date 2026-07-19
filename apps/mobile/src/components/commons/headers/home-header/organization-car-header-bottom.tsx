import { useGlobalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getCarById } from '@/apis/car/car-apis';
import { getTripById } from '@/apis/trip/trip-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { SegmentedControl, SegmentedControlItem } from '@/components/primitives/segmented-control';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

type CarViewCode = 'cars' | 'trips';

const CAR_VIEW_ITEMS: SegmentedControlItem<CarViewCode>[] = [
  { value: 'cars', label: 'Tất cả xe' },
  { value: 'trips', label: 'Chuyến xe' },
];

const OrganizationCarHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useGlobalSearchParams<{ organizationId: string; carView?: string }>();
  const currentView: CarViewCode = params.carView === 'trips' ? 'trips' : 'cars';

  const [localView, setLocalView] = useState<CarViewCode>(currentView);

  const { createCar, isCreatingCar, createTrip, isCreatingTrip } = useOrganizationActionsContext();

  const handleSegmentChange = (value: CarViewCode) => router.setParams({ carView: value });

  const handleAddNewCar = () => {
    createCar(
      { organizationId: params.organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getCarById(data?.id || ''), {
              fetchKey: `organization-car-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/car-detail/[carId]',
            params: { carId: data?.id || '' },
          });
        },
        onError: (error) => Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo xe mới')),
      },
    );
  };

  const handleAddNewTrip = () => {
    createTrip(
      { organizationId: params.organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getTripById(data?.id || ''), {
              fetchKey: `organization-trip-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/trip-detail/[tripId]',
            params: { tripId: data?.id || '' },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo chuyến mới')),
      },
    );
  };

  // ─── Add-new branches by current segment ───────────────────────────
  // The list shown is driven by `carView` param (currentView), so the "+" must
  // create the same entity type the user is currently looking at.
  const handleAddNew = currentView === 'trips' ? handleAddNewTrip : handleAddNewCar;

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.segmentWrapper}>
        <SegmentedControl
          items={CAR_VIEW_ITEMS}
          value={localView}
          onChange={setLocalView}
          onSettled={handleSegmentChange}
          style={{
            pill: { backgroundColor: COLORS.white, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)' },
            label: { fontSize: FONT_SIZES.base },
          }}
        />
      </View>
      <Button
        onPress={handleAddNew}
        isLoading={isCreatingCar || isCreatingTrip}
        loaderStyle={{ size: 30 }}
      >
        <VinaupAddNew width={30} height={30} />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  segmentWrapper: {
    flex: 1,
  },
});

export default OrganizationCarHeaderBottom;
