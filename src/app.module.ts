import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {NginxModule} from "./Nginx/nginx.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV}.env`,
      isGlobal: true
    }),
    NginxModule,
  ]
})
export class AppModule {}
