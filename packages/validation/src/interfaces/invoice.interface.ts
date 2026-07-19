import type { z } from 'zod';

import { createInvoiceSchema, invoiceFilterSchema, updateInvoiceSchema } from '../zod-schemas/invoice.schema';

export type CreateInvoiceRequestInterface = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceRequestInterface = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFilterRequestInterface = z.infer<typeof invoiceFilterSchema>;
