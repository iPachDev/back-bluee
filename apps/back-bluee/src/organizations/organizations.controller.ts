import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { ResponseEnvelope, TraceEntry } from '../common/response.interface';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub ?? '';
    const createPayload = { ...payload, userId };
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.organizationsService.create(createPayload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.organizationsService.update(payload, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async remove(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.organizationsService.remove(id, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async getById(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    return this.handleResponse(res, transactionId, () =>
      this.organizationsService.getById(id, {
        transactionId,
        source: 'back-bluee',
      }),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async list(
    @Req() req: TransactionRequest & { user?: { sub?: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    return this.handleResponse(res, transactionId, () =>
      this.organizationsService.listByUserId(userId, {
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
