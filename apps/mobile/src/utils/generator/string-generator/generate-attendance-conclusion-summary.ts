import { AttendanceConclusionResponse } from '@/interfaces/attendance-interfaces';

import { generateLocaleFormatString } from './generate-locale-format-string';

/**
 * Renders a conclusion's worked total the way the manager entered it.
 *
 * @param attendanceConclusion - The conclusion to summarise.
 * @returns e.g. `1 công - 2h TC`, `0,5 công`, `Nghỉ P`, or `—` when nothing was entered.
 *
 * @example
 * generateAttendanceConclusionSummary({ workdayUnit: 1, overtimeHours: 2, ... });
 * // → "1 công - 2h TC"
 */
export function generateAttendanceConclusionSummary(
  attendanceConclusion: AttendanceConclusionResponse,
): string {
  const {
    workdayUnit,
    seasonalHours,
    overtimeHours,
    authorizedLeaveDayUnit,
    unauthorizedLeaveDayUnit,
  } = attendanceConclusion;

  const partList = [
    workdayUnit > 0 ? `${generateLocaleFormatString(workdayUnit, 'vi-VN', 2)} công` : null,
    seasonalHours > 0 ? `${generateLocaleFormatString(seasonalHours, 'vi-VN', 2)}h TV` : null,
    // "TC" (tăng ca) rather than a leading "+", which would read as "- +2h" next to the separator.
    overtimeHours > 0 ? `${generateLocaleFormatString(overtimeHours, 'vi-VN', 2)}h TC` : null,
  ].filter(Boolean);

  if (partList.length > 0) return partList.join(' - ');

  const leavePartList = [
    authorizedLeaveDayUnit > 0
      ? `Nghỉ P ${generateLocaleFormatString(authorizedLeaveDayUnit, 'vi-VN', 2)}`
      : null,
    unauthorizedLeaveDayUnit > 0
      ? `Nghỉ KP ${generateLocaleFormatString(unauthorizedLeaveDayUnit, 'vi-VN', 2)}`
      : null,
  ].filter(Boolean);

  return leavePartList.length > 0 ? leavePartList.join(' - ') : '—';
}
