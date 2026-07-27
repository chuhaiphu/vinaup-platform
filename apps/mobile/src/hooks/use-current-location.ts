import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { useAppPermissionFromOsContext } from '@/providers/commons/app-permission-from-os-provider';
import { generateLocaleAddress } from '@/utils/generator/string-generator/generate-locale-address';

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
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Effect 1 — raise the system dialog the first time a coordinate is needed.
  useEffect(() => {
    if (!enabled) return;
    if (!locationPermission?.canAskAgain) return;

    let isEffectActive = true;

    async function requestForegroundPermission() {
      await Location.requestForegroundPermissionsAsync();
      if (!isEffectActive) return;
      await syncPermissions();
    }

    requestForegroundPermission();

    return () => {
      isEffectActive = false;
    };
  }, [enabled, locationPermission?.canAskAgain, syncPermissions]);

  // Effect 2 — read the position, but only under precise authorization.
  useEffect(() => {
    if (!enabled || !isPreciseLocationGranted) return;

    let isEffectActive = true;

    async function loadCurrentLocation() {
      try {
        setIsFetchingLocation(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!isEffectActive) return;
        setCurrentLocation(location);

        // The platform geocoders answer with a list, so `reverseGeocodeAsync` forwards their shape.
        // Android is already narrowed with maxResults 1, so one entry arrives.
        // iOS can send several, but Apple documents not mention what the extra entries mean,
        // so the first is taken.
        const [geocodedAddress] = await Location.reverseGeocodeAsync(location.coords);
        if (!isEffectActive) return;
        if (geocodedAddress) setLocationAddress(generateLocaleAddress(geocodedAddress));
      } catch {
        // Swallowed for now: the coordinate is supplementary, so a failed fix — the device
        // location switch being off, or no signal indoors — must not block the punch.
      } finally {
        // `return` inside the try still runs this block, so it needs the same gate.
        if (isEffectActive) setIsFetchingLocation(false);
      }
    }

    loadCurrentLocation();

    return () => {
      isEffectActive = false;
    };
  }, [enabled, isPreciseLocationGranted]);

  // Two ways: The provider is still reading, or the dialog of effect 1 is on screen waiting to be answered.
  const isResolvingPermission = enabled && isSyncingPermission;

  return {
    currentLocation,
    locationAddress,
    isPreciseLocationGranted,
    isLoading: isResolvingPermission || isFetchingLocation,
  };
}
