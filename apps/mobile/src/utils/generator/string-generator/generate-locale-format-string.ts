/**
 * Formats a number as a locale-aware string value string with decimal rounding support.
 *
 * This function rounds the string value to the specified number of decimal places and
 * formats it according to the specified locale's number formatting conventions.
 *
 * @param string value - Numeric value to format. Can be positive, negative, or zero.
 * @param locale - BCP 47 locale string. Defaults to 'vi-VN'.
 * @param decimalPlaces - MAXIMUM number of decimal places to show. Defaults to 0 (no
 *   decimals). The fraction is never padded with trailing zeros: a whole value renders
 *   without a decimal part ("10"), and only significant decimals appear ("10,5").
 * @returns Formatted string value according to locale conventions.
 *
 * @example
 * // Basic usage - Vietnamese locale (default)
 * generateLocaleFormatString(1500000);                    // "1.500.000"
 * generateLocaleFormatString(1234567.89);                 // "1.234.568"
 *
 * @example
 * // English locale
 * generateLocaleFormatString(1500000, 'en-US');           // "1,500,000"
 * generateLocaleFormatString(1234567.89, 'en-US');        // "1,234,568"
 *
 * @example
 * // Up to N decimal places (trailing zeros are dropped)
 * generateLocaleFormatString(1500000.567, 'vi-VN', 2);    // "1.500.000,57"
 * generateLocaleFormatString(1500000.567, 'en-US', 2);    // "1,500,000.57"
 * generateLocaleFormatString(10, 'vi-VN', 2);             // "10"      (not "10,00")
 * generateLocaleFormatString(10.5, 'vi-VN', 2);           // "10,5"    (not "10,50")
 * generateLocaleFormatString(1234.567, 'vi-VN', 1);       // "1.234,6"
 *
 */
export const generateLocaleFormatString = (
  value: number,
  locale: Intl.LocalesArgument = 'vi-VN',
  decimalPlaces: number = 0,
): string => {
  // Step 1: Calculate multiplier (10^n)
  // Example: for 2 decimal places, multiplier = 100
  const multiplier = Math.pow(10, decimalPlaces);

  // Step 2: Shift decimal point to the right
  // Example: 1500000.567 * 100 = 150000056.7
  const shiftedValue = value * multiplier;

  // Step 3: Round to the nearest integer
  // Example: 150000056.7 rounded = 150000057
  const roundedShiftedValue = Math.round(shiftedValue);

  // Step 4: Shift decimal point back to original position
  // Example: 150000057 / 100 = 1500000.57
  const roundedValue = roundedShiftedValue / multiplier;

  // Step 5: Format according to locale, capping decimals at `decimalPlaces`
  // minimumFractionDigits is 0 so whole/short values aren't padded with trailing
  // zeros ("10" instead of "10,00"); `decimalPlaces` acts purely as the upper bound.
  return roundedValue.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });
};
