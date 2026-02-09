import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { ResponseEnvelope, TraceEntry } from './response.interface';
import { TransactionRequest } from './transaction.middleware';

type EnvelopeLike<T = unknown> = {
  data?: T;
  trace?: TraceEntry[];
  errors?: string[];
  statusCode?: number;
  isSuccess?: boolean;
};

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<TransactionRequest>();
    const res = ctx.getResponse<Response>();
    const transactionId = req.transactionId || 'unknown';
    const start = new Date().toISOString();

    return next.handle().pipe(
      map((result) => {
        const end = new Date().toISOString();
        const baseTrace: TraceEntry = {
          from: 'client',
          to: 'back-bluee',
          timestart: start,
          timeend: end,
          signature: 'back-bluee',
        };

        let statusCode = 200;
        let isSuccess = true;
        let data: unknown = null;
        let errors: string[] = [];
        let trace: TraceEntry[] = [];

        if (result && typeof result === 'object' && 'headers' in result) {
          const envelope = result as ResponseEnvelope<unknown>;
          statusCode = envelope.headers?.statusCode ?? 200;
          isSuccess = envelope.headers?.isSuccess ?? true;
          data = envelope.data ?? null;
          errors = envelope.errors ?? [];
          trace = envelope.headers?.trazability ?? [];
        } else if (result && typeof result === 'object' && 'data' in result) {
          const payload = result as EnvelopeLike<unknown>;
          statusCode = payload.statusCode ?? 200;
          isSuccess =
            payload.isSuccess ?? (payload.errors?.length ? false : true);
          data = payload.data ?? null;
          errors = payload.errors ?? [];
          trace = payload.trace ?? [];
        } else {
          data = result ?? null;
        }

        const body: ResponseEnvelope<unknown> = {
          headers: {
            transactionId,
            isSuccess,
            statusCode,
            trazability: [...trace, baseTrace],
          },
          data,
          errors,
        };

        res.status(statusCode);
        return body;
      }),
    );
  }
}
