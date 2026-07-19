import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppConfig } from './_core/configs/app.config';
import { LegacyValidationPipe } from './_core/pipes/legacy-validation.pipe';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  app.enableCors({
    origin: appConfig?.cors.origin,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new LegacyValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // Enable runtime conversion so @Type() decorators actually take effect
      // (e.g. @Type(() => Number) on query params). Without this, typed DTO
      // fields keep their raw request type (query/param strings) at runtime.
      transform: true,
    }),
    new ZodValidationPipe(),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(8000);
}
void bootstrap();
