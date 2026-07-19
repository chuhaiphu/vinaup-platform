import { manageReceiverSignaturesSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ManageReceiverSignaturesRequest extends createZodDto(manageReceiverSignaturesSchema) {}
