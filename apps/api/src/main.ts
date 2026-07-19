import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppConfig } from './_core/configs/app.config';
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
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(8000);
}
void bootstrap();
