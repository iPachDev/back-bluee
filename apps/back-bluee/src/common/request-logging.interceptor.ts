import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TransactionRequest } from './transaction.middleware';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<TransactionRequest>();
    const res = ctx.getResponse();
    const start = Date.now();
    const requestId = req.transactionId;
    res.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const method = req.method;
        const url = req.originalUrl || req.url;
        const status = res.statusCode;
        console.log(`[${requestId}] ${method} ${url} ${status} ${duration}ms`);
      }),
    );
  }
}
