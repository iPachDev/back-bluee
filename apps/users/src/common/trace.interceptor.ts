import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, catchError, map, of } from 'rxjs';
import { ResponseEnvelope, TraceEntry } from './response.interface';
import { normalizeRmqPayload } from './rmq.utils';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = new Date().toISOString();
    const payload = context.switchToRpc().getData();
    const { meta } = normalizeRmqPayload(payload);
    const transactionId = meta.transactionId || randomUUID();
    const source = meta.source || 'unknown';
    const component = process.env.MS_NAME_USERS;
    if (!component) {
      throw new Error('MS_NAME_USERS environment variable is not set');
    }
    const trace: TraceEntry[] = [...(meta.trazability ?? [])];

    return next.handle().pipe(
      map((result) => {
        const end = new Date().toISOString();
        trace.push({
          from: source,
          to: component,
          timestart: start,
          timeend: end,
          signature: component,
        });
        const response: ResponseEnvelope<typeof result> = {
          headers: {
            transactionId,
            isSuccess: true,
            statusCode: 200,
            trazability: trace,
          },
          data: result ?? null,
          errors: [],
        };
        return response;
      }),
      catchError((error) => {
        const end = new Date().toISOString();
        trace.push({
          from: source,
          to: component,
          timestart: start,
          timeend: end,
          signature: component,
        });
        const message = this.normalizeError(error);
        const statusCode = this.mapErrorToStatus(message);
        const response: ResponseEnvelope<null> = {
          headers: {
            transactionId,
            isSuccess: false,
            statusCode,
            trazability: trace,
          },
          data: null,
          errors: [message],
        };
        return of(response);
      }),
    );
  }

  private mapErrorToStatus(message: string): number {
    if (message.includes('demasiadas solicitudes')) {
      return 429;
    }
    if (message.includes('no autorizado') || message.includes('credenciales')) {
      return 401;
    }
    if (message.includes('no encontrado')) {
      return 404;
    }
    return 400;
  }

  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'error inesperado';
  }
}
