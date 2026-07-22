export const ATTENDANCE_MODE = {
  CHECK_IN: 'CHECK_IN',
  CHECK_IN_OUT: 'CHECK_IN_OUT',
} as const;
export type AttendanceMode = (typeof ATTENDANCE_MODE)[keyof typeof ATTENDANCE_MODE];

export const ATTENDANCE_RECORD_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type AttendanceRecordStatus =
  (typeof ATTENDANCE_RECORD_STATUS)[keyof typeof ATTENDANCE_RECORD_STATUS];

export const ATTENDANCE_CONCLUSION_STATUS = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
} as const;
export type AttendanceConclusionStatus =
  (typeof ATTENDANCE_CONCLUSION_STATUS)[keyof typeof ATTENDANCE_CONCLUSION_STATUS];
