import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useEffect, Suspense } from 'react';

import { IndexShellSkeleton } from '@/components/commons/skeletons/index-shell-skeleton';
import { ErrorBoundary } from '@/components/primitives/error-boundary';
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
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="personal/(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="organization/[organizationId]"
                    options={{ headerShown: false }}
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
