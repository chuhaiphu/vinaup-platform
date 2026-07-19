import { manageMembersAssignedSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class ManageMembersAssignedRequest extends createZodDto(manageMembersAssignedSchema) {}
