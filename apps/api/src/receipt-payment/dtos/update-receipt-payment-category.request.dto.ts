import { updateReceiptPaymentCategorySchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateReceiptPaymentCategoryRequest extends createZodDto(updateReceiptPaymentCategorySchema) {}
