import { Prisma } from 'src/prisma/generated/client';

export const attendanceRecordQueryArgs = {
  include: { organizationMember: true },
} satisfies Prisma.AttendanceRecordDefaultArgs;

export type AttendanceRecordResponse = Prisma.AttendanceRecordGetPayload<typeof attendanceRecordQueryArgs>;
