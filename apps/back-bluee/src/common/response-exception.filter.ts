import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionRequest } from './transaction.middleware';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<TransactionRequest>();
    const transactionId = req.transactionId || 'unknown';
    const start = new Date().toISOString();

    let statusCode = 500;
    let message = 'error inesperado';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response?.message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      if (message.includes('demasiadas solicitudes')) {
        statusCode = 429;
      } else if (
        message.includes('no autorizado') ||
        message.includes('credenciales')
      ) {
        statusCode = 401;
      } else if (message.includes('no encontrado')) {
        statusCode = 404;
      } else {
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      headers: {
        transactionId,
        isSuccess: false,
        statusCode,
        trazability: [
          {
            from: 'client',
            to: 'back-bluee',
            timestart: start,
            timeend: new Date().toISOString(),
            signature: 'back-bluee',
          },
        ],
      },
      data: null,
      errors: [message],
    });
  }
}
