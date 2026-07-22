import { z } from 'zod';

import { ATTENDANCE_CONCLUSION_STATUS, ATTENDANCE_MODE } from '../constants/attendance.constant';

// ─── AttendanceRecord ─────────────────────────────────────────────
export const createAttendanceRecordSchema = z.strictObject({
  organizationId: z.string().trim().min(1),
  mode: z.enum(ATTENDANCE_MODE),
  note: z.string().trim().min(1).nullish(),
});

// Check-out carries no time either — the server stamps checkOutAt = now().
export const checkOutAttendanceRecordSchema = z.strictObject({
  organizationId: z.string().trim().min(1),
  note: z.string().trim().min(1).nullish(),
});

// A punch is immutable except for its note.
export const updateAttendanceRecordSchema = z.strictObject({
  note: z.string().trim().min(1).nullish(),
});

// A workday is addressed by a bare YYYY-MM-DD (calendar date), never an instant.
export const attendanceRecordFilterSchema = z
  .strictObject({
    workDateFrom: z.iso.date().optional(),
    workDateTo: z.iso.date().optional(),
  })
  .refine((value) => !value.workDateTo || Boolean(value.workDateFrom), {
    error: 'workDateFrom is required when workDateTo is provided',
    path: ['workDateFrom'],
  })
  .refine((value) => !value.workDateFrom || Boolean(value.workDateTo), {
    error: 'workDateTo is required when workDateFrom is provided',
    path: ['workDateTo'],
  });

// ─── AttendanceConclusion ─────────────────────────────────────────
const conclusionMetricFields = {
  workdayUnit: z.number().min(0).max(1).optional(), // ngày công (0 / 0.5 / 1)
  seasonalHours: z.number().min(0).optional(), // giờ công thời vụ
  overtimeHours: z.number().min(0).optional(), // giờ tăng ca
  authorizedLeaveDayUnit: z.number().min(0).max(1).optional(), // nghỉ có phép (ngày)
  unauthorizedLeaveDayUnit: z.number().min(0).max(1).optional(), // nghỉ không phép (ngày)
  lateArrivalCount: z.number().int().min(0).optional(), // đi trễ (lần)
  earlyDepartureCount: z.number().int().min(0).optional(), // về sớm (lần)
  note: z.string().trim().min(1).nullish(),
  status: z.enum(ATTENDANCE_CONCLUSION_STATUS).optional(),
};

export const createAttendanceConclusionSchema = z.strictObject({
  organizationId: z.string().trim().min(1),
  organizationMemberId: z.string().trim().min(1),
  workDate: z.iso.date(), // "2026-05-01" — a calendar date, NOT z.iso.datetime()
  ...conclusionMetricFields,
});

export const updateAttendanceConclusionSchema = z.strictObject(conclusionMetricFields);
