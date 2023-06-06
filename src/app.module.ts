import { Module } from '@nestjs/common';
import {NginxModule} from "./Nginx/nginx.module";
@Module({
  imports: [NginxModule]
})
export class AppModule {}
