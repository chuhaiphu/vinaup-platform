import { useRouter, useGlobalSearchParams } from 'expo-router';
import { prefetch } from 'fetchwire';
import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';

import { getBookingById } from '@/apis/booking/booking-apis';
import VinaupAddNew from '@/components/icons/vinaup-add-new.native';
import { Button } from '@/components/primitives/button';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/style-constants';
import { useNavigationStore } from '@/hooks/use-navigation-store';
import { useOrganizationActionsContext } from '@/providers/organization/organization-actions-provider';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

const OrganizationBookingHeaderBottom = () => {
  const router = useRouter();
  const setIsNavigating = useNavigationStore((s) => s.setIsNavigating);
  const params = useGlobalSearchParams<{
    organizationId: string;
  }>();

  const { createBooking, isCreatingBooking: isMutating } = useOrganizationActionsContext();

  const handleAddNew = () => {
    createBooking(
      { organizationId: params.organizationId },
      {
        onSuccess: async (data) => {
          const bookingId = data?.id || '';
          if (!bookingId) {
            Alert.alert('Lỗi', 'Không thể tạo Booking mới');
            return;
          }

          setIsNavigating(true);
          try {
            await prefetch(() => getBookingById(bookingId), {
              fetchKey: `organization-booking-${bookingId}`,
            });
          } catch {
            // Fallback to normal navigation if prefetch fails.
          }
          setIsNavigating(false);

          router.push({
            pathname: '/(protected)/booking-detail/[bookingId]',
            params: { bookingId },
          });
        },
        onError: (error) =>
          Alert.alert('Lỗi', generateErrorMessage(error, 'Không thể tạo Booking mới')),
      },
    );
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.titleWrapper}>
        <Text style={styles.titleLeft}>Tạo mới</Text>
        <Text style={styles.titleRight}> Booking</Text>
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

export default OrganizationBookingHeaderBottom;
