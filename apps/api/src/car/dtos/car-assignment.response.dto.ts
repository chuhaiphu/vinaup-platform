import { Prisma } from 'src/prisma/generated/client';

// ─── A state row always ships its car + member (with user + organization) ───
export const carAssignmentQueryArgs = {
  include: {
    car: true,
    organizationMember: {
      include: { user: true, organization: true },
    },
  },
} satisfies Prisma.CarAssignmentDefaultArgs;

export type CarAssignmentResponse = Prisma.CarAssignmentGetPayload<typeof carAssignmentQueryArgs>;
