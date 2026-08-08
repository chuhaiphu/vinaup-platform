import { linkEmailSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class LinkEmailRequest extends createZodDto(linkEmailSchema) {}
