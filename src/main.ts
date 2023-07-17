import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ClaimsGuard } from './shared/claims.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: {origin: '*'}});
  app.useGlobalPipes(new ValidationPipe({whitelist: true}))
  app.setGlobalPrefix('admin-panel')
  app.useGlobalGuards(new ClaimsGuard(['isAdmin']))
  app.enableCors({origin: [/http\:\/\/localhost\:\d+/, "https://mcsynergy.nl", "https://dev.mcsynergy.nl"]})
  await app.listen(3000);
}
bootstrap();
