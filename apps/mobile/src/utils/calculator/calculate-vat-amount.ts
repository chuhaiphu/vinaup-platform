/**
 * Extracts the VAT embedded in a VAT-inclusive amount, rounded to whole đồng.
 *
 * @param total - VAT-inclusive amount (whole đồng).
 * @param vatRate - VAT rate as a percent (e.g. 10 for 10%). Falsy → 0 VAT.
 * @returns The VAT portion of `total`, rounded to whole đồng.
 *
 * @example
 * calculateVatAmount(100000, 10); // 9091  (100000 − 100000/1.1 = 9090.90… → round)
 */
export function calculateVatAmount(total: number, vatRate?: number | null): number {
  const vatRateFraction = (vatRate || 0) / 100;
  return Math.round(total - total / (1 + vatRateFraction));
}
