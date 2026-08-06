import {
  embeddedOrganizationMemberQueryArgs,
  toEmbeddedOrganizationMemberResponse,
  type EmbeddedOrganizationMemberResponse,
} from 'src/organization/dtos/organization-member.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

export const attendanceRecordQueryArgs = {
  include: { organizationMember: embeddedOrganizationMemberQueryArgs },
} satisfies Prisma.AttendanceRecordDefaultArgs;

type AttendanceRecordPayload = Prisma.AttendanceRecordGetPayload<
  typeof attendanceRecordQueryArgs
>;
export type AttendanceRecordResponse = Omit<AttendanceRecordPayload, 'organizationMember'> & {
  organizationMember: EmbeddedOrganizationMemberResponse;
};

export const toAttendanceRecordResponse = (
  attendanceRecord: AttendanceRecordPayload,
  storageService: StorageService,
): AttendanceRecordResponse => {
  const { organizationMember, ...attendanceRecordRest } = attendanceRecord;
  return {
    ...attendanceRecordRest,
    organizationMember: toEmbeddedOrganizationMemberResponse(organizationMember, storageService),
  };
};
