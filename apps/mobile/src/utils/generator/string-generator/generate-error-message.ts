import { ApiError } from 'fetchwire';

import { ERROR_MESSAGES_MAP_VN } from '@/constants/error-constants';

/**
 * Resolves the Vietnamese copy for a caught error, keyed by its stable machine code.
 * Never returns the server `message` (English/dev-facing) — see ERROR_MESSAGES_MAP_VN.
 *
 * @param error - The caught error value: a code string, an ApiError (code read from
 *   `errorCode`), or anything else (falls back).
 * @param fallback - Message returned when the code is absent from the map. Defaults to `_FALLBACK_`.
 * @returns A non-empty Vietnamese message string.
 * @example
 * Alert.alert('Lỗi', generateErrorMessage(error, 'Có lỗi xảy ra khi xoá.'));
 */
export function generateErrorMessage(
  error: unknown,
  fallback = ERROR_MESSAGES_MAP_VN._FALLBACK_,
): string {
  const code =
    typeof error === 'string' ? error : error instanceof ApiError ? error.errorCode : undefined;

  return (code && ERROR_MESSAGES_MAP_VN[code]) || fallback;
}
