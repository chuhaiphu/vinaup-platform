import { createInvoiceSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateInvoiceRequest extends createZodDto(createInvoiceSchema) {}
