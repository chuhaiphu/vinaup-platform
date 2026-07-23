import { Prisma } from 'src/prisma/generated/client';

export const invoiceQueryArgs = {
  include: {
    createdBy: true,
    organization: true,
    organizationCustomer: true,
  },
} satisfies Prisma.InvoiceDefaultArgs;

export type InvoiceResponse = Prisma.InvoiceGetPayload<typeof invoiceQueryArgs>;
