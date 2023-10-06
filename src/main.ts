/* eslint-disable prettier/prettier */
import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ClaimsGuard } from './shared/claims.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import {AllExceptionsFilter} from "./shared/exception-filter";
import {LoggingInterceptor} from "./shared/logging-interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: { origin: '*' }, logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('admin-panel');
  app.useGlobalGuards(new ClaimsGuard(['isAdmin']));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  app.useGlobalInterceptors(new LoggingInterceptor());
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
