import { ATTENDANCE_MODE } from '@vinaup-platform/validation';
import type { AttendanceMode } from '@vinaup-platform/validation';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export { ATTENDANCE_MODE, ATTENDANCE_RECORD_STATUS } from '@vinaup-platform/validation';
export type { AttendanceMode, AttendanceRecordStatus } from '@vinaup-platform/validation';

export const AttendanceModeDisplay: Record<AttendanceMode, string> = {
  [ATTENDANCE_MODE.CHECK_IN]: 'Check in',
  [ATTENDANCE_MODE.CHECK_IN_OUT]: 'Check in - out',
};

// Which end of a punch the sheet is confirming. Device-only — the API splits these
// into two endpoints rather than carrying an action field on the wire.
export const ATTENDANCE_PUNCH_ACTION = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
} as const;
export type AttendancePunchAction =
  (typeof ATTENDANCE_PUNCH_ACTION)[keyof typeof ATTENDANCE_PUNCH_ACTION];

export const AttendancePunchActionDisplay: Record<AttendancePunchAction, string> = {
  [ATTENDANCE_PUNCH_ACTION.CHECK_IN]: 'Xác nhận check in',
  [ATTENDANCE_PUNCH_ACTION.CHECK_OUT]: 'Xác nhận check out',
};
