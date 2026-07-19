import { createOrganizationCustomerSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateOrganizationCustomerRequest extends createZodDto(createOrganizationCustomerSchema) {}
