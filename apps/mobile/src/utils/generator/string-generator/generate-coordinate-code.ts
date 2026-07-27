/** Decimal places kept from each coordinate — see the note inside generateCoordinateCode. */
const COORDINATE_DECIMAL_PLACES = 5;

/**
 * Renders a WGS 84 coordinate as the location code shown to the user.
 *
 * @param coords - Latitude and longitude in degrees, straight from `LocationObject.coords`.
 * @returns A comma-separated decimal-degrees pair, e.g. "16.06780,108.22080".
 * @example
 * generateCoordinateCode(location.coords); // "16.06780,108.22080"
 */
export function generateCoordinateCode(coords: { latitude: number; longitude: number }): string {
  // 5 decimal places resolve to ~1.1 m — finer than the best fix a phone can produce (~4.9 m in the
  // open sky), so no real signal is truncated. A 6th place would claim 111 mm precision the device
  // never measured, a 4th would round an 11 m step onto a fix that is more accurate than that.
  const latitude = coords.latitude.toFixed(COORDINATE_DECIMAL_PLACES);
  const longitude = coords.longitude.toFixed(COORDINATE_DECIMAL_PLACES);

  // Comma-separated is the exact shape the Google Maps URL `query` parameter accepts, so this one
  // string serves both the displayed code and the map link — no second format to drift out of sync.
  return `${latitude},${longitude}`;
}
