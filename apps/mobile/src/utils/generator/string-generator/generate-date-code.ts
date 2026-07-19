/**
 * Generates a date code in DDMMYYYY format from the current date.
 * Intended as a short suffix for document codes.
 *
 * @returns An 8-character string, e.g. "01052026" for 1 May 2026.
 * @example
 * const code = `BOOK-${generateDateCode()}`; // "BOOK-01052026"
 */
export function generateDateCode(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return `${dd}${mm}${yyyy}`;
}
