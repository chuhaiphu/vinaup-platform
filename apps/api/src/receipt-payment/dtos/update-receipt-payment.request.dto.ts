import { updateReceiptPaymentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateReceiptPaymentRequest extends createZodDto(updateReceiptPaymentSchema) {}
