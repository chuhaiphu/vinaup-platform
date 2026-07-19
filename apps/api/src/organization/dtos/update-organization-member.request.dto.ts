import { updateOrganizationMemberSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateOrganizationMemberRequest extends createZodDto(updateOrganizationMemberSchema) {}
