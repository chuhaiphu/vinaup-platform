import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

interface AppPermissionFromOsContextType {
  locationPermission: Location.LocationPermissionResponse | null;
  isPreciseLocationGranted: boolean;
  /** True while a read is in flight — including the very first one, before any answer exists. */
  isSyncingPermission: boolean;
  syncPermissions: () => Promise<void>;
}

const AppPermissionFromOsContext = createContext<AppPermissionFromOsContextType | null>(null);

export function useAppPermissionFromOsContext() {
  const context = useContext(AppPermissionFromOsContext);
  if (!context) {
    throw new Error(
      'useAppPermissionFromOsContext must be used within AppPermissionFromOsProvider',
    );
  }
  return context;
}

function checkPreciseLocationGranted(permission: Location.LocationPermissionResponse | null) {
  if (!permission?.granted) return false;
  if (Platform.OS === 'ios') return permission.ios?.accuracy === 'full';
  return permission.android?.accuracy === 'fine';
}

export function AppPermissionFromOsProvider({ children }: { children: React.ReactNode }) {
  const appState = useRef(AppState.currentState);

  const [locationPermission, setLocationPermission] =
    useState<Location.LocationPermissionResponse | null>(null);

  // Starts true: effect 1 reads on mount, so the very first render is already "not answered yet"
  // rather than "not granted".
  const [isSyncingPermission, setIsSyncingPermission] = useState(true);

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const syncPermissions = useCallback(async () => {
    setIsSyncingPermission(true);
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      // Logout unmounts the whole protected tree; a read started on the way out lands here.
      if (isMountedRef.current) setLocationPermission(permission);
    } finally {
      if (isMountedRef.current) setIsSyncingPermission(false);
    }
  }, []);

  // Effect 1 — read once on mount.
  useEffect(() => {
    async function readPermissionsOnMount() {
      await syncPermissions();
    }

    readPermissionsOnMount();
  }, [syncPermissions]);

  // Effect 2 — re-read when the app returns to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        syncPermissions();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [syncPermissions]);

  return (
    <AppPermissionFromOsContext
      value={{
        locationPermission,
        isPreciseLocationGranted: checkPreciseLocationGranted(locationPermission),
        isSyncingPermission,
        syncPermissions,
      }}
    >
      {children}
    </AppPermissionFromOsContext>
  );
}
