import { createSocialLinkSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateSocialLinkRequest extends createZodDto(createSocialLinkSchema) {}
