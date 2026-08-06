import { z } from 'zod';

import { DOCUMENT_TYPE } from '../constants/signature.constant';

export const manageReceiverSignaturesSchema = z.strictObject({
  documentId: z.string().trim().min(1),
  documentType: z.enum(DOCUMENT_TYPE),
  targetUserIds: z
    .array(z.string())
    .refine((list) => new Set(list).size === list.length, {
      error: 'targetUserIds không được chứa phần tử trùng lặp',
    }),
});

