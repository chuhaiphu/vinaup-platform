import { findReceiptPaymentsByProjectIdsSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class FindReceiptPaymentsByProjectIdsRequest extends createZodDto(findReceiptPaymentsByProjectIdsSchema) {}
