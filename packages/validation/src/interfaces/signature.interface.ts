import type { z } from 'zod';

import { manageReceiverSignaturesSchema } from '../zod-schemas/signature.schema';

export type ManageReceiverSignaturesRequestInterface = z.infer<typeof manageReceiverSignaturesSchema>;
