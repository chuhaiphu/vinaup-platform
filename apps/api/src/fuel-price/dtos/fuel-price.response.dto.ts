import { Prisma } from 'src/prisma/generated/client';

export const fuelPriceQueryArgs = {
  select: {
    id: true,
    e10Ron95: true,
    e5Ron92: true,
    diesel: true,
    electricity: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies Prisma.FuelPriceDefaultArgs;

export type FuelPriceResponse = Prisma.FuelPriceGetPayload<typeof fuelPriceQueryArgs>;
