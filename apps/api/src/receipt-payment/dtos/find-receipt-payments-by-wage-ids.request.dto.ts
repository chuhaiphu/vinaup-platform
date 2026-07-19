import { findReceiptPaymentsByWageIdsSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class FindReceiptPaymentsByWageIdsRequest extends createZodDto(findReceiptPaymentsByWageIdsSchema) {}
