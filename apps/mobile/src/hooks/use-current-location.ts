import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { useAppPermissionFromOsContext } from '@/providers/commons/app-permission-from-os-provider';

export interface UseCurrentLocationOptions {
  /**
   * Skips the whole read when the caller has no use for a coordinate — no permission dialog,
   * no sensor powered up, no reverse geocode, and every returned value stays at its initial state.
   */
  enabled?: boolean;
}

/** Lets a caller hand the whole reading down to a child instead of re-calling the hook there. */
export type UseCurrentLocationResult = ReturnType<typeof useCurrentLocation>;

export function useCurrentLocation({ enabled = true }: UseCurrentLocationOptions = {}) {
  const { locationPermission, isPreciseLocationGranted, isSyncingPermission, syncPermissions } =
    useAppPermissionFromOsContext();

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isResolvingGeocodedAddress, setIsResolvingGeocodedAddress] = useState(false);

  // Effect 1 — raise the system dialog the first time a coordinate is needed.
  useEffect(() => {
    if (!enabled) return;
    if (!locationPermission?.canAskAgain) return;

    let ignore = false;

    async function requestForegroundPermission() {
      await Location.requestForegroundPermissionsAsync();
      if (ignore) return;
      await syncPermissions();
    }

    requestForegroundPermission();

    return () => {
      ignore = true;
    };
  }, [enabled, locationPermission?.canAskAgain, syncPermissions]);

  // Effect 2 — read the position, but only under precise authorization.
  useEffect(() => {
    if (!enabled || !isPreciseLocationGranted) return;

    let ignore = false;

    async function loadCurrentLocation() {
      try {
        setIsFetchingLocation(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (ignore) return;
        setCurrentLocation(location);
      } catch {
        // Swallowed for now: the coordinate is supplementary, so a failed fix
      } finally {
        // `return` inside the try still runs this block, so it needs the same gate.
        if (!ignore) setIsFetchingLocation(false);
      }
    }

    loadCurrentLocation();

    return () => {
      ignore = true;
    };
  }, [enabled, isPreciseLocationGranted]);

  /**
   * Turns the fix already in state into a postal address
   *
   * @returns The address, or null when there is no fix yet or the geocoder answered with nothing.
   */
  const resolveGeocodedAddress =
    useCallback(async (): Promise<Location.LocationGeocodedAddress | null> => {
      if (!currentLocation) return null;

      try {
        setIsResolvingGeocodedAddress(true);
        // The platform geocoders answer with a list, so `reverseGeocodeAsync` forwards their shape.
        // Android is already narrowed with maxResults 1, so one entry arrives.
        // iOS can send several, but Apple documents not mention what the extra entries mean,
        // so the first is taken.
        const [geocodedAddress] = await Location.reverseGeocodeAsync(currentLocation.coords);
        return geocodedAddress ?? null;
      } catch {
        // Swallowed like the fix itself: an address is a convenience on top of the coordinate,
        // so a failed lookup must leave the caller's own value untouched instead of erroring.
        return null;
      } finally {
        setIsResolvingGeocodedAddress(false);
      }
    }, [currentLocation]);

  // Two ways: The provider is still reading, or the dialog of effect 1 is on screen waiting to be answered.
  const isResolvingPermission = enabled && isSyncingPermission;

  return {
    currentLocation,
    isPreciseLocationGranted,
    isLoading: isResolvingPermission || isFetchingLocation,
    isResolvingGeocodedAddress,
    resolveGeocodedAddress,
  };
}
