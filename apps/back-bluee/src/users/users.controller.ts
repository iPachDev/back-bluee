import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { ResponseEnvelope, TraceEntry } from '../common/response.interface';
import { TransactionRequest } from '../common/transaction.middleware';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.usersService.create(payload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Put()
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.usersService.update(payload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.usersService.remove(id, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.usersService.find(
        { _id: id },
        { transactionId, source: 'back-bluee' },
      ),
    );
  }

  @Get()
  async getByEmployeeNumber(
    @Query('employeeNumber') employeeNumber: string | undefined,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.usersService.find(
        { employeeNumber },
        { transactionId, source: 'back-bluee' },
      ),
    );
  }

  private async handleResponse<T>(
    res: Response,
    transactionId: string,
    action: () => Promise<ResponseEnvelope<T>>,
  ): Promise<ResponseEnvelope<T>> {
    const start = new Date().toISOString();
    try {
      const result = await action();
      const end = new Date().toISOString();
      const trace: TraceEntry[] = [
        ...(result.headers?.trazability ?? []),
        {
          from: 'client',
          to: 'back-bluee',
          timestart: start,
          timeend: end,
          signature: 'back-bluee',
        },
      ];
      const statusCode = result.headers?.statusCode ?? 200;
      const body: ResponseEnvelope<T> = {
        headers: {
          transactionId,
          isSuccess: result.headers?.isSuccess ?? true,
          statusCode,
          trazability: trace,
        },
        data: result.data ?? null,
        errors: result.errors ?? [],
      };
      res.status(statusCode);
      return body;
    } catch (error) {
      const end = new Date().toISOString();
      const message = this.normalizeError(error);
      const statusCode = this.mapErrorToStatus(message);
      res.status(statusCode);
      return {
        headers: {
          transactionId,
          isSuccess: false,
          statusCode,
          trazability: [
            {
              from: 'client',
              to: 'back-bluee',
              timestart: start,
              timeend: end,
              signature: 'back-bluee',
            },
          ],
        },
        data: null,
        errors: [message],
      };
    }
  }

  private mapErrorToStatus(message: string): number {
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
