import { useLocalSearchParams, useRouter } from 'expo-router';
import { prefetch } from 'fetchwire';
import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';

import { getTourById } from '@/apis/tour/tour-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const OrganizationTourHeaderBottom = () => {
  const router = useRouter();
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);

  const { createTour, isCreatingTour: isMutating } = useOrganizationActionsContext();

  const handleAddNew = () => {
    createTour(
      { organizationId },
      {
        onSuccess: async (data) => {
          setIsNavigating(true);
          try {
            await prefetch(() => getTourById(data?.id || ''), {
              fetchKey: `organization-tour-${data?.id}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);
          router.push({
            pathname: '/(protected)/tour-detail/[tourId]',
            params: { tourId: data ? data.id : '' },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo tour mới')),
      },
    );
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleLeft}>Tour</Text>
        <Text style={styles.titleRight}> Trong nước</Text>
      </View>
      <Button onPress={handleAddNew} isLoading={isMutating} loaderStyle={{ size: 30 }}>
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
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLeft: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.teal900,
  },
  titleRight: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.teal700,
  },
});

export default OrganizationTourHeaderBottom;
