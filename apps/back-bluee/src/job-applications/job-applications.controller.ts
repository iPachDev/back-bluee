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
import { JobApplicationsService } from './job-applications.service';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';

@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
  ) {
    if (!payload?.tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.jobApplicationsService.create(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
  ) {
    if (!payload?.tenantId || !payload?._id) {
      throw new BadRequestException('tenantId y _id son requeridos');
    }
    const transactionId = req.transactionId;
    return this.jobApplicationsService.update(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.jobApplicationsService.remove(id, tenantId, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get()
  async getByTenant(
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.jobApplicationsService.getByTenant(tenantId, {
      transactionId,
      source: 'back-bluee',
    });
  }
}
