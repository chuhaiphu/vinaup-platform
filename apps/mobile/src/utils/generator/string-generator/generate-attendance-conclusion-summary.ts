import { AttendanceConclusionResponse } from '@/interfaces/attendance-interfaces';

import { generateLocaleFormatString } from './generate-locale-format-string';

/**
 * Renders a conclusion's worked total the way the manager entered it.
 *
 * @param attendanceConclusion - The conclusion to summarise.
 * @returns e.g. `0,5 công + 3h`, `1 công`, `Nghỉ P 1`, or `null` when every metric is still zero.
 *
 * @example
 * generateAttendanceConclusionSummary({ workdayUnit: 0.5, seasonalHours: 1, overtimeHours: 2, ... });
 * // → "0,5 công + 3h"
 */
export function generateAttendanceConclusionSummary(
  attendanceConclusion: AttendanceConclusionResponse,
): string | null {
  const {
    workdayUnit,
    seasonalHours,
    overtimeHours,
    authorizedLeaveDayUnit,
    unauthorizedLeaveDayUnit,
  } = attendanceConclusion;

  const paidHours = seasonalHours + overtimeHours;

  const partList = [
    workdayUnit > 0 ? `${generateLocaleFormatString(workdayUnit, 'vi-VN', 2)} công` : null,
    paidHours > 0 ? `${generateLocaleFormatString(paidHours, 'vi-VN', 2)}h` : null,
  ].filter(Boolean);

  if (partList.length > 0) return partList.join(' + ');

  const leavePartList = [
    authorizedLeaveDayUnit > 0
      ? `Nghỉ P ${generateLocaleFormatString(authorizedLeaveDayUnit, 'vi-VN', 2)}`
      : null,
    unauthorizedLeaveDayUnit > 0
      ? `Nghỉ KP ${generateLocaleFormatString(unauthorizedLeaveDayUnit, 'vi-VN', 2)}`
      : null,
  ].filter(Boolean);

  return leavePartList.length > 0 ? leavePartList.join(' + ') : null;
}
