import { createReceiptPaymentCategorySchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateReceiptPaymentCategoryRequest extends createZodDto(createReceiptPaymentCategorySchema) {}
