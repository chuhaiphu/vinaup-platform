import type { ReceiptPaymentCategory } from 'src/prisma/generated/client';

// Full-row response (no projection → no query-args const).
export type ReceiptPaymentCategoryResponse = ReceiptPaymentCategory;
