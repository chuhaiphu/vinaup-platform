import { receiptPaymentFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ReceiptPaymentFilterRequest extends createZodDto(receiptPaymentFilterSchema) {}
