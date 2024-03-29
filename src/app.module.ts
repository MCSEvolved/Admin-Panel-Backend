import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NginxModule } from './Nginx/nginx.module';
import { DockerModule } from './Docker/docker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    NginxModule,
    DockerModule,
  ],
})
export class AppModule { }
