import { tourFilterSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class TourFilterRequest extends createZodDto(tourFilterSchema) {}
