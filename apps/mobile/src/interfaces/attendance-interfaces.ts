import {
  AttendanceConclusionStatus,
  AttendanceMode,
  AttendanceRecordStatus,
} from '@/constants/attendance-constants';

import { OrganizationMemberResponse } from './organization-member-interfaces';

export type {
  CheckOutAttendanceRecordRequestInterface as CheckOutAttendanceRecordRequest,
  CreateAttendanceConclusionRequestInterface as CreateAttendanceConclusionRequest,
  CreateAttendanceRecordRequestInterface as CreateAttendanceRecordRequest,
  UpdateAttendanceConclusionRequestInterface as UpdateAttendanceConclusionRequest,
  UpdateAttendanceRecordRequestInterface as UpdateAttendanceRecordRequest,
} from '@vinaup-platform/validation';

// The API embeds the bare OrganizationMember row (no nested relations of its own).
// Shared by both attendance responses — the record and the conclusion embed the same shape.
export type AttendanceOrganizationMember = Omit<
  OrganizationMemberResponse,
  'createdBy' | 'user' | 'organization' | 'organizationRole'
>;

export interface AttendanceRecordResponse {
  id: string;
  organizationId: string;
  organizationMemberId: string;
  checkInAt: string;
  checkOutAt: string | null;
  workDate: string;
  mode: AttendanceMode;
  status: AttendanceRecordStatus;
  note: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  organizationMember: AttendanceOrganizationMember;
}

// The manager's hand-entered verdict for one (member, workDate).
// Every metric is NOT NULL @default(0) on the API side, so none of them is nullable here.
export interface AttendanceConclusionResponse {
  id: string;
  organizationId: string;
  organizationMemberId: string;
  workDate: string;
  status: AttendanceConclusionStatus;
  workdayUnit: number;
  seasonalHours: number;
  overtimeHours: number;
  authorizedLeaveDayUnit: number;
  unauthorizedLeaveDayUnit: number;
  lateArrivalCount: number;
  earlyDepartureCount: number;
  note: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  organizationMember: AttendanceOrganizationMember;
}
