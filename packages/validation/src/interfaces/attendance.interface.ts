import type { z } from 'zod';

import {
  attendanceRecordFilterSchema,
  checkOutAttendanceRecordSchema,
  createAttendanceConclusionSchema,
  createAttendanceRecordSchema,
  updateAttendanceConclusionSchema,
  updateAttendanceRecordSchema,
} from '../zod-schemas/attendance.schema';

export type CreateAttendanceRecordRequestInterface = z.infer<typeof createAttendanceRecordSchema>;
export type CheckOutAttendanceRecordRequestInterface = z.infer<typeof checkOutAttendanceRecordSchema>;
export type UpdateAttendanceRecordRequestInterface = z.infer<typeof updateAttendanceRecordSchema>;
export type AttendanceRecordFilterRequestInterface = z.infer<typeof attendanceRecordFilterSchema>;
export type CreateAttendanceConclusionRequestInterface = z.infer<typeof createAttendanceConclusionSchema>;
export type UpdateAttendanceConclusionRequestInterface = z.infer<typeof updateAttendanceConclusionSchema>;
