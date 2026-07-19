import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';

/**
 * Temporary bridge for the class-validator → Zod migration.
 *
 * `ValidationPipe({ whitelist: true })` strips every property that carries no
 * class-validator decorator — which is ALL properties of a `createZodDto` class —
 * so running it on a Zod DTO would empty the payload before `ZodValidationPipe`
 * ever sees it. Skip Zod DTOs here; delete this pipe once class-validator is gone.
 */
@Injectable()
export class LegacyValidationPipe extends ValidationPipe {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const metatype = metadata.metatype as { isZodDto?: boolean } | undefined;
    if (metatype?.isZodDto) return value;
    return super.transform(value, metadata);
  }
}
