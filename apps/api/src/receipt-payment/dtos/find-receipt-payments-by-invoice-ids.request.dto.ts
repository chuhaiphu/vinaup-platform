import { findReceiptPaymentsByInvoiceIdsSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class FindReceiptPaymentsByInvoiceIdsRequest extends createZodDto(findReceiptPaymentsByInvoiceIdsSchema) {}
