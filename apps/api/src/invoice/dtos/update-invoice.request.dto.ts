import { updateInvoiceSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateInvoiceRequest extends createZodDto(updateInvoiceSchema) {}
