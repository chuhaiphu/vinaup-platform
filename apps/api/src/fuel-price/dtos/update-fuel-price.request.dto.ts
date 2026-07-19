import { updateFuelPriceSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateFuelPriceRequest extends createZodDto(updateFuelPriceSchema) {}
