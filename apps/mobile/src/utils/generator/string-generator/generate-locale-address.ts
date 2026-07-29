import type { LocationGeocodedAddress } from 'expo-location';

export type AddressPart =
  'name' | 'street' | 'district' | 'subregion' | 'city' | 'region' | 'postalCode' | 'country';

export interface GenerateLocaleAddressOptions {
  orderedPartList?: AddressPart[];
}

const DEFAULT_PART_LIST: AddressPart[] = ['name', 'street', 'district', 'subregion', 'city'];

const SEPARATOR = ', ';

/**
 * Flattens one reverse-geocoded address into a single comma-separated line, in the device locale.
 *
 * The `street` part is the whole street line: the street number and the street name joined by a
 * space, so it reads "123 Nguyễn Văn Linh" rather than two comma-separated values.
 *
 * Empty parts and duplicate parts are dropped, so no part is assumed present.
 *
 * @param geocodedAddress - One entry from `Location.reverseGeocodeAsync`.
 * @param options.orderedPartList - Which parts to include, in output order. Defaults to smallest unit
 *   first, the way a Vietnamese address is written.
 * @returns The address on one line, or null when every selected part came back empty.
 * @example
 * generateLocaleAddress(address);
 * // "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng"
 * @example
 * generateLocaleAddress(address, { orderedPartList: ['city', 'country'] });
 * // "Đà Nẵng, Việt Nam"
 */
export function generateLocaleAddress(
  geocodedAddress: LocationGeocodedAddress,
  options: GenerateLocaleAddressOptions = {},
): string | null {
  const { orderedPartList = DEFAULT_PART_LIST } = options;

  const rawAddressText = orderedPartList.map((part) => buildAddressPartText(geocodedAddress, part));
  // Drops parts the geocoder left empty.
  // ['123 Nguyễn Văn Linh', '', 'Hải Châu'] → ['123 Nguyễn Văn Linh', 'Hải Châu']
  const rawAddressTextWithoutEmptyPart = rawAddressText.filter((part) => part.length > 0);

  // Drops repeated parts, keeping the first one.
  // ['Hải Châu', 'Đà Nẵng', 'Đà Nẵng'] → ['Hải Châu', 'Đà Nẵng']
  const finalAddressText = [...new Set(rawAddressTextWithoutEmptyPart)];

  if (finalAddressText.length === 0) return null;
  return finalAddressText.join(SEPARATOR);
}

// Every field is trimmed because a spaces-only value would pass
// the `length > 0` emptiness check above and produce a doubled separator.
function buildAddressPartText(geocodedAddress: LocationGeocodedAddress, part: AddressPart): string {
  // we want 'street' renders as one line, "123 Nguyễn Văn Linh"
  // if the part is 'street', also get the 'streetNumber' and attach it to the text.
  if (part === 'street') {
    const streetNumber = geocodedAddress.streetNumber?.trim() ?? '';
    const street = geocodedAddress.street?.trim() ?? '';
    return `${streetNumber} ${street}`.trim();
  }

  return geocodedAddress[part]?.trim() ?? '';
}
