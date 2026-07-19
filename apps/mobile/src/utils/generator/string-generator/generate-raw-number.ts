/**
 * Parses a locale-formatted number string back to a raw integer.
 *
 * Inverse of `generateLocaleFormatString` for integer (no-decimal) values.
 * Strips vi-VN thousand separators (dots) before parsing.
 *
 * @example
 * generateRawNumber("1.500.000")  // 1500000
 * generateRawNumber("")           // 0
 */
export function generateRawNumber(value: string): number {
  if (typeof value === 'number') return value;
  // Strip vi-VN thousand separators (dots) before parsing
  // Why: "1.500.000" → "1500000" → 1500000
  return Number.parseInt(value.replaceAll('.', ''), 10) || 0;
}
