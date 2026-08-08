import { resolve } from 'node:path';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppConfig } from './_core/configs/app.config';
import { StorageConfig } from './_core/configs/storage.config';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  app.enableCors({
    origin: appConfig?.cors.origin,
    credentials: true,
  });

  // ─── Dev-only static serving for uploaded files
  const storageConf = configService.get<StorageConfig>('storage')!;
  if (process.env.NODE_ENV !== 'production' && storageConf.driver === 'local') {
    app.useStaticAssets(resolve(storageConf.localRoot), {
      prefix: new URL(storageConf.publicBaseUrl).pathname,
    });
  }

  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(8000);
}
void bootstrap();
