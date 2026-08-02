import type { MaterialDesignIconsIconName } from '@react-native-vector-icons/material-design-icons/static';
import { ATTENDANCE_CONCLUSION_STATUS, ATTENDANCE_MODE } from '@vinaup-platform/validation';
import type { AttendanceConclusionStatus, AttendanceMode } from '@vinaup-platform/validation';

import { COLORS } from './style-constants';

// Wire enums referenced by shared Zod schemas live in the package (§1.3).
export {
  ATTENDANCE_CONCLUSION_STATUS,
  ATTENDANCE_MODE,
  ATTENDANCE_RECORD_STATUS,
} from '@vinaup-platform/validation';
export type {
  AttendanceConclusionStatus,
  AttendanceMode,
  AttendanceRecordStatus,
} from '@vinaup-platform/validation';

export const AttendanceModeDisplay: Record<AttendanceMode, string> = {
  [ATTENDANCE_MODE.CHECK_IN]: 'Check in',
  [ATTENDANCE_MODE.CHECK_IN_OUT]: 'Check in + Check out',
};

export const AttendanceConclusionStatusDisplay: Record<AttendanceConclusionStatus, string> = {
  [ATTENDANCE_CONCLUSION_STATUS.DRAFT]: 'Chờ duyệt',
  [ATTENDANCE_CONCLUSION_STATUS.COMPLETED]: 'Hoàn thành',
};

// A checkbox drawn at three fill levels: empty, part-filled, ticked — the verdict's own progress.
export const AttendanceConclusionStatusIcon: Record<
  AttendanceConclusionStatus,
  MaterialDesignIconsIconName
> = {
  [ATTENDANCE_CONCLUSION_STATUS.DRAFT]: 'checkbox-intermediate',
  [ATTENDANCE_CONCLUSION_STATUS.COMPLETED]: 'checkbox-marked-outline',
};

export const AttendanceConclusionStatusIconColor: Record<AttendanceConclusionStatus, string> = {
  [ATTENDANCE_CONCLUSION_STATUS.DRAFT]: COLORS.orange700,
  [ATTENDANCE_CONCLUSION_STATUS.COMPLETED]: COLORS.teal700,
};

// A workday with no conclusion row at all — the third state, which the status enum cannot express.
export const ATTENDANCE_CONCLUSION_UNSET_LABEL = 'Chưa chốt';
export const ATTENDANCE_CONCLUSION_UNSET_ICON: MaterialDesignIconsIconName =
  'checkbox-blank-outline';
export const ATTENDANCE_CONCLUSION_UNSET_ICON_COLOR = COLORS.gray500;

export const ATTENDANCE_DAY_UNIT_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 0, label: '0' },
  { value: 0.5, label: '0,5' },
  { value: 1, label: '1' },
];

export const ATTENDANCE_PUNCH_ACTION = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
} as const;
export type AttendancePunchAction =
  (typeof ATTENDANCE_PUNCH_ACTION)[keyof typeof ATTENDANCE_PUNCH_ACTION];

export const AttendancePunchActionDisplay: Record<AttendancePunchAction, string> = {
  [ATTENDANCE_PUNCH_ACTION.CHECK_IN]: 'Check In',
  [ATTENDANCE_PUNCH_ACTION.CHECK_OUT]: 'Check Out',
};
