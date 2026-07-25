import { AttendanceMode, AttendanceRecordStatus } from '@/constants/attendance-constants';

import { OrganizationMemberResponse } from './organization-member-interfaces';

export type {
  CheckOutAttendanceRecordRequestInterface as CheckOutAttendanceRecordRequest,
  CreateAttendanceRecordRequestInterface as CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequestInterface as UpdateAttendanceRecordRequest,
} from '@vinaup-platform/validation';

// The API embeds the bare OrganizationMember row (no nested relations of its own).
export type AttendanceRecordOrganizationMember = Omit<
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
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  organizationMember: AttendanceRecordOrganizationMember;
}
