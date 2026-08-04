import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useEffect, Suspense } from 'react';

import { IndexShellSkeleton } from '@/components/commons/skeletons/index-shell-skeleton';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
import { STACK_SCREEN_OPTIONS } from '@/constants/app-constants';
import { AllOrganizationsProvider } from '@/providers/auth/all-organizations-provider';
import { useAuthContext } from '@/providers/auth/auth-provider';
import { OrganizationProvider } from '@/providers/auth/organization-provider';
import { AppNotificationCheckerProvider } from '@/providers/commons/app-notification-checker-provider';
import { AppPermissionFromOsProvider } from '@/providers/commons/app-permission-from-os-provider';

SplashScreen.preventAutoHideAsync();

export default function ProtectedLayout() {
  const { isLoading, currentUser } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<IndexShellSkeleton />}>
        <AllOrganizationsProvider>
          <OrganizationProvider>
            <AppPermissionFromOsProvider>
              <AppNotificationCheckerProvider>
                <Stack screenOptions={STACK_SCREEN_OPTIONS}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="personal/(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="organization/[organizationId]"
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="attendance-management/index"
                    options={{ title: 'Quản lý chấm công' }}
                  />
                  <Stack.Screen
                    name="attendance-management/[organizationMemberId]"
                    options={{ title: 'Chi tiết chấm công' }}
                  />
                  <Stack.Screen
                    name="booking-detail/[bookingId]/index"
                    options={{ title: 'Chi tiết Booking' }}
                  />
                  <Stack.Screen
                    name="booking-detail/[bookingId]/booking-detail-preview"
                    options={{ title: 'Xem trước Booking' }}
                  />
                  <Stack.Screen name="car-detail/[carId]" options={{ title: 'Chi tiết xe' }} />
                  <Stack.Screen
                    name="car-maintenance-log/index"
                    options={{ title: 'Nhật ký bảo trì' }}
                  />
                  <Stack.Screen
                    name="invoice-detail/[invoiceId]"
                    options={{ title: 'Chi tiết Hoá đơn' }}
                  />
                  <Stack.Screen
                    name="project-detail/[projectId]"
                    options={{ title: 'Chi tiết Dự án' }}
                  />
                  <Stack.Screen
                    name="receipt-payment-detail/[receiptPaymentId]"
                    options={{ title: 'Chi tiết Thu Chi' }}
                  />
                  <Stack.Screen
                    name="tour-calculation-cancel-log-detail/[tourCalculationCancelLogId]"
                    options={{ title: 'Chi tiết Nhật ký' }}
                  />
                  <Stack.Screen name="tour-detail/[tourId]" options={{ title: 'Quản lý Tour' }} />
                  <Stack.Screen
                    name="tour-settlement-cancel-log-detail/[tourSettlementCancelLogId]"
                    options={{ title: 'Chi tiết Nhật ký' }}
                  />
                  <Stack.Screen
                    name="trip-detail/[tripId]/index"
                    options={{ title: 'Chi tiết chuyến' }}
                  />
                  <Stack.Screen
                    name="trip-detail/[tripId]/trip-cost"
                    options={{ title: 'Thu chi chuyến xe' }}
                  />
                  <Stack.Screen
                    name="wage-detail/[wageId]"
                    options={{ title: 'Chi tiết Tiền công' }}
                  />
                </Stack>
              </AppNotificationCheckerProvider>
            </AppPermissionFromOsProvider>
          </OrganizationProvider>
        </AllOrganizationsProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
