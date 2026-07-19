import { updateSocialLinkSchema } from '@vinaup-platform/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateSocialLinkRequest extends createZodDto(updateSocialLinkSchema) {}
