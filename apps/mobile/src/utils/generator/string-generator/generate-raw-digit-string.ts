/**
 * Converts a number into a raw, digits-only string for digit-string form fields.
 *
 * Inverse direction of `generateLocaleFormatString`: where that turns a number into a
 * locale display string ("1.500.000"), this turns a number into the bare value a form
 * stores and a numeric input expects ("1500000"). Pairs with `generateRawNumber`, which
 * parses such strings back to numbers.
 *
 * Empty for falsy input: 0/null/undefined map to '' so a cleared field shows its
 * placeholder instead of a literal "0".
 *
 * @param value - Numeric value to convert.
 * @param options.round - Round to the nearest integer first. Defaults to true, so float
 *   dust from % conversions (99999.7) collapses to clean digits ("100000") instead of
 *   leaking a decimal point ("99999.7") into the digit-only string.
 * @returns Digits-only string, or '' for falsy input.
 *
 * @example
 * generateRawDigitString(100000);              // "100000"
 * generateRawDigitString(99999.7);             // "100000" (rounded)
 * generateRawDigitString(99999.7, { round: false }); // "99999.7"
 * generateRawDigitString(0);                   // ""
 * generateRawDigitString(null);                // ""
 */
export function generateRawDigitString(
  value?: number | null,
  { round = true }: { round?: boolean } = {},
): string {
  if (!value) return '';
  return String(round ? Math.round(value) : value);
}
