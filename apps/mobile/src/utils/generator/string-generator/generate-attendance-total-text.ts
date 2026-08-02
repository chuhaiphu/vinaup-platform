import {
  AttendanceConclusionResponse,
  AttendanceRecordResponse,
} from '@/interfaces/attendance-interfaces';
import { calculateAttendanceTotalMinutes } from '@/utils/calculator/calculate-attendance-total-minutes';

import { generateAttendanceConclusionSummary } from './generate-attendance-conclusion-summary';
import { generateDurationText } from './generate-duration-text';

/**
 * Renders one workday's total for a single member.
 *
 * @param attendanceRecords - The member's records for that workday.
 * @param attendanceConclusion - The verdict on file, or `null` while the day is unconcluded.
 * @param now - "Now", supplied by the caller so one timer drives every still-open total.
 * @returns The manager's figures once they entered any, otherwise the measured clock.
 *
 * @example
 * generateAttendanceTotalText(records, null, now); // → "8h30p"
 * generateAttendanceTotalText(records, { workdayUnit: 1, ... }, now); // → "1 công"
 */
export function generateAttendanceTotalText(
  attendanceRecords: AttendanceRecordResponse[],
  attendanceConclusion: AttendanceConclusionResponse | null,
  now: Date,
): string {
  const conclusionSummary = attendanceConclusion
    ? generateAttendanceConclusionSummary(attendanceConclusion)
    : null;

  // A conclusion whose metrics are all zero states nothing, so the clock stays on screen —
  // a day can be concluded as "nothing to pay" and still have hours worth reading.
  return (
    conclusionSummary ??
    generateDurationText(calculateAttendanceTotalMinutes(attendanceRecords, now))
  );
}
