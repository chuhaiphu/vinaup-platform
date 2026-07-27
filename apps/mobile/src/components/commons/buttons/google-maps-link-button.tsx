import * as Linking from 'expo-linking';

import VinaupGoogleMap from '@/components/icons/vinaup-google-map.native';
import { PressableOpacity } from '@/components/primitives/pressable-opacity';
import { COLORS, ICON_SIZES } from '@/constants/style-constants';
import { generateCoordinateCode } from '@/utils/generator/string-generator/generate-coordinate-code';
import { generateGoogleMapsUrl } from '@/utils/generator/string-generator/generate-google-maps-url';

interface GoogleMapsLinkButtonProps {
  /** A punch coordinate — nullable because a record may have been made without a fix. */
  latitude?: number | null;
  longitude?: number | null;
  size?: number;
}

/**
 * Opens Google Maps on a stored or freshly measured coordinate. Renders disabled — greyed and
 * inert — when either half of the pair is missing, so the row keeps its shape either way.
 */
export function GoogleMapsLinkButton({
  latitude,
  longitude,
  size = ICON_SIZES.md,
}: GoogleMapsLinkButtonProps) {
  // Latitude 0 is a valid coordinate, so only null/undefined disables the button.
  const coordinateCode =
    latitude != null && longitude != null ? generateCoordinateCode({ latitude, longitude }) : null;

  const handleOpenGoogleMaps = async () => {
    if (!coordinateCode) return;

    try {
      await Linking.openURL(generateGoogleMapsUrl(coordinateCode));
    } catch {
      // Opening a map is supplementary to the record — a failure here must not surface as an error.
    }
  };

  return (
    <PressableOpacity onPress={handleOpenGoogleMaps} disabled={!coordinateCode} hitSlop={8}>
      <VinaupGoogleMap
        width={size}
        height={size}
        color={coordinateCode ? COLORS.teal700 : COLORS.gray400}
      />
    </PressableOpacity>
  );
}
