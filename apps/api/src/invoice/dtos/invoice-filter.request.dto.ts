import { invoiceFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class InvoiceFilterRequest extends createZodDto(invoiceFilterSchema) {}
