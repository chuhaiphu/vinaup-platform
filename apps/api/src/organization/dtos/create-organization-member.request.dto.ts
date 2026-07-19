import { createOrganizationMemberSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateOrganizationMemberRequest extends createZodDto(createOrganizationMemberSchema) {}
