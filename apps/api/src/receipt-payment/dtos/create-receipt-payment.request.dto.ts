import { createReceiptPaymentSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateReceiptPaymentRequest extends createZodDto(createReceiptPaymentSchema) {}
