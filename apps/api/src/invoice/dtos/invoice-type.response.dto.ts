import type { InvoiceType } from 'src/prisma/generated/client';

// Full-row response (no projection → no query-args const).
export type InvoiceTypeResponse = InvoiceType;
