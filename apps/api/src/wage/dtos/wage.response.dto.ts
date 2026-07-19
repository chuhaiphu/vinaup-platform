import { Prisma } from 'src/prisma/generated/client';

export const wageQueryArgs = {
  include: { createdBy: true },
} satisfies Prisma.WageDefaultArgs;

export type WageResponse = Prisma.WageGetPayload<typeof wageQueryArgs>;
