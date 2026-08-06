import {
  embeddedOrganizationMemberQueryArgs,
  toEmbeddedOrganizationMemberResponse,
  type EmbeddedOrganizationMemberResponse,
} from 'src/organization/dtos/organization-member.response.dto';
import { Prisma } from 'src/prisma/generated/client';
import type { StorageService } from 'src/storage/storage.service';

export const attendanceConclusionQueryArgs = {
  include: { organizationMember: embeddedOrganizationMemberQueryArgs },
} satisfies Prisma.AttendanceConclusionDefaultArgs;

type AttendanceConclusionPayload = Prisma.AttendanceConclusionGetPayload<
  typeof attendanceConclusionQueryArgs
>;
export type AttendanceConclusionResponse = Omit<
  AttendanceConclusionPayload,
  'organizationMember'
> & {
  organizationMember: EmbeddedOrganizationMemberResponse;
};

export const toAttendanceConclusionResponse = (
  attendanceConclusion: AttendanceConclusionPayload,
  storageService: StorageService,
): AttendanceConclusionResponse => {
  const { organizationMember, ...attendanceConclusionRest } = attendanceConclusion;
  return {
    ...attendanceConclusionRest,
    organizationMember: toEmbeddedOrganizationMemberResponse(organizationMember, storageService),
  };
};
