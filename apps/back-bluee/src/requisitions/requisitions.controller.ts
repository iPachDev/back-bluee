import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequisitionsService } from './requisitions.service';
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
  ) {
    const transactionId = req.transactionId;
    return this.requisitionsService.create(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
  ) {
    const transactionId = req.transactionId;
    return this.requisitionsService.update(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.requisitionsService.remove(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.requisitionsService.getById(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.requisitionsService.listByTenant(tenantId, {
      transactionId,
      source: 'back-bluee',
    });
  }
}
