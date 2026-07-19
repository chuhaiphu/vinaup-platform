import { updateTourSettlementSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateTourSettlementRequest extends createZodDto(updateTourSettlementSchema) {}
