import type { z } from 'zod';

import { manageReceiverSignaturesSchema, updateSignatureUrlSchema } from '../zod-schemas/signature.schema';

export type ManageReceiverSignaturesRequestInterface = z.infer<typeof manageReceiverSignaturesSchema>;
export type UpdateSignatureUrlRequestInterface = z.infer<typeof updateSignatureUrlSchema>;
