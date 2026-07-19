import { updateOrganizationSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateOrganizationRequest extends createZodDto(updateOrganizationSchema) {}
