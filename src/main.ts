/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ClaimsGuard } from './shared/claims.guard';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: { origin: '*' }, logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('admin-panel');
  app.useGlobalGuards(new ClaimsGuard(['isAdmin']));
  app.enableCors({
    origin: [
      /http\:\/\/localhost\:\d+/,
      'https://mcsynergy.nl',
      'https://dev.mcsynergy.nl',
    ],
  });
  app.set('trust proxy', 1);
  await app.listen(3000);
}
bootstrap();
