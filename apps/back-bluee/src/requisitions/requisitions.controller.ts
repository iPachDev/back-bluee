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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import {
  type CreateRequisitionDto,
  type UpdateRequisitionDto,
} from './dto/requisition.dto';

@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async create(
    @Body() payload: CreateRequisitionDto,
    @Req() req: TransactionRequest & { user?: { sub?: string; email?: string } },
  ) {
    const transactionId = req.transactionId;
    const actorId = req.user?.sub ?? req.user?.email ?? '';
    const nextPayload: CreateRequisitionDto = {
      ...payload,
      approvalFlow: {
        ...payload.approvalFlow,
        requestedBy: payload.approvalFlow?.requestedBy ?? actorId,
      },
      audit: {
        ...payload.audit,
        createdBy: payload.audit?.createdBy ?? actorId,
        updatedBy: actorId,
      },
    };
    return this.requisitionsService.create(nextPayload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async update(
    @Body() payload: UpdateRequisitionDto,
    @Req() req: TransactionRequest & { user?: { sub?: string; email?: string } },
  ) {
    const transactionId = req.transactionId;
    const actorId = req.user?.sub ?? req.user?.email ?? '';
    const nextPayload: UpdateRequisitionDto = {
      ...payload,
      audit: {
        ...payload.audit,
        updatedBy: actorId,
      },
    };
    return this.requisitionsService.update(nextPayload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async remove(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.requisitionsService.remove(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get('public')
  async listPublic(
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.requisitionsService.listPublicByTenant(tenantId, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get('public/:id')
  async getPublicById(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const transactionId = req.transactionId;
    return this.requisitionsService.getPublicById(id, tenantId, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async getById(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.requisitionsService.getById(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
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
