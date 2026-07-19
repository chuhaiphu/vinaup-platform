import { updateOrganizationCustomerSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateOrganizationCustomerRequest extends createZodDto(updateOrganizationCustomerSchema) {}
