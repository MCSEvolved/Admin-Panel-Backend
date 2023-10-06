
import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = new Logger()
    return next
      .handle()
      .pipe(
        tap(res => logger.log(res))
      );
  }
}