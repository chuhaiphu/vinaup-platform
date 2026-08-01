import { ATTENDANCE_RECORD_STATUS } from '@/constants/attendance-constants';
import { AttendanceRecordResponse } from '@/interfaces/attendance-interfaces';

import { calculateDurationInMinutes } from './calculate-duration-in-minutes';

/**
 * Totals the worked minutes of every attendance record in one workday.
 *
 * Each record ends at `checkOutAt`, or at `now` while still `OPEN`.
 *
 * A `CLOSED` record with no `checkOutAt` — a lone check-in punch,
 * or a session force-closed on conclusion — has no end at all and contributes `0`.
 *
 * @param attendanceRecords - Every record of the workday being totalled.
 * @param now - "Now", supplied by the caller so one timer drives the whole list.
 * @returns Whole minutes across all records.
 */
export function calculateAttendanceTotalMinutes(
  attendanceRecords: AttendanceRecordResponse[],
  now: Date,
): number {
  return attendanceRecords.reduce((totalMinutes, attendanceRecord) => {
    const { checkInAt, checkOutAt, status } = attendanceRecord;

    // A finished session
    if (checkOutAt) {
      return totalMinutes + calculateDurationInMinutes(new Date(checkInAt), new Date(checkOutAt));
    }

    // A session still running
    if (status === ATTENDANCE_RECORD_STATUS.OPEN) {
      return totalMinutes + calculateDurationInMinutes(new Date(checkInAt), now);
    }

    // CLOSED with no check-out: a lone check-in punch, or a session force-closed on conclusion.
    return totalMinutes;
  }, 0);
}
