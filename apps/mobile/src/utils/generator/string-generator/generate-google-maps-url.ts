/**
 * Cross-platform Maps URLs endpoint. Google recommends these universal https URLs over the
 * `comgooglemaps://` scheme, and https needs no LSApplicationQueriesSchemes (iOS) or <queries>
 * (Android 11+) declaration, so no native rebuild is involved in opening a map.
 */
const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=';

/**
 * Builds the Google Maps link that drops a pin on a punch's coordinate.
 *
 * @param coordinateCode - Output of {@link generateCoordinateCode}, i.e. "latitude,longitude".
 * @returns A Maps URL, e.g. "https://www.google.com/maps/search/?api=1&query=16.06780%2C108.22080".
 * @example
 * Linking.openURL(generateGoogleMapsUrl(generateCoordinateCode(location.coords)));
 */
export function generateGoogleMapsUrl(coordinateCode: string): string {
  return `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(coordinateCode)}`;
}
