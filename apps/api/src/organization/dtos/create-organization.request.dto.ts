import { createOrganizationSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateOrganizationRequest extends createZodDto(createOrganizationSchema) {}
