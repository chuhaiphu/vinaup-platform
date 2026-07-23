import { Prisma } from 'src/prisma/generated/client';

export const receiptPaymentQueryArgs = {
  include: {
    createdBy: true,
    project: true,
    organization: true,
    invoice: true,
    booking: true,
    tourCalculation: true,
    tourImplementationReceiptPayments: true,
    tourSettlement: true,
    wage: true,
    category: true,
    carMaintenanceLog: true,
    trip: true,
  },
} satisfies Prisma.ReceiptPaymentDefaultArgs;

export type ReceiptPaymentResponse = Prisma.ReceiptPaymentGetPayload<typeof receiptPaymentQueryArgs>;
