import { Prisma } from 'src/prisma/generated/client';

export const attendanceConclusionQueryArgs = {
  include: { organizationMember: true },
} satisfies Prisma.AttendanceConclusionDefaultArgs;

export type AttendanceConclusionResponse = Prisma.AttendanceConclusionGetPayload<typeof attendanceConclusionQueryArgs>;
