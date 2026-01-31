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
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { RequisitionsService } from './requisitions.service';
import { ResponseEnvelope, TraceEntry } from '../common/response.interface';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.requisitionsService.create(payload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.requisitionsService.update(payload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.requisitionsService.remove(id, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.requisitionsService.getById(id, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!tenantId) {
      return this.handleError(res, req.transactionId, 'tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.requisitionsService.listByTenant(tenantId, {
        transactionId,
        source: 'back-bluee',
      }),
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

  private handleError(
    res: Response,
    transactionId: string,
    message: string,
  ): ResponseEnvelope<null> {
    const statusCode = 400;
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
            timestart: new Date().toISOString(),
            timeend: new Date().toISOString(),
            signature: 'back-bluee',
          },
        ],
      },
      data: null,
      errors: [message],
    };
  }

  private mapErrorToStatus(message: string): number {
    if (message.includes('no encontrada')) {
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
