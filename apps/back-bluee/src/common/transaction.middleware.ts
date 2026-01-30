import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export interface TransactionRequest extends Request {
  transactionId: string;
}

@Injectable()
export class TransactionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    (req as TransactionRequest).transactionId = randomUUID();
    next();
  }
}
