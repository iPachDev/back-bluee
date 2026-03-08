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



  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Candidate)
  async apply(
    @Param('id') id: string,
    @Body() payload: { tenantId?: string },
    @Req() req: TransactionRequest & { user?: { sub?: string; email?: string; tenantId?: string } },
  ) {
    const tenantId = payload?.tenantId ?? req.user?.tenantId ?? '';
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }

    const userId = req.user?.sub ?? '';
    const candidateEmail = req.user?.email ?? '';
    if (!userId || userId === 'null' || userId === 'undefined') {
      throw new BadRequestException('usuario candidato inválido');
    }

    return this.requisitionsService.applyToRequisition(
      {
        tenantId,
        requisitionId: id,
        userId,
        candidateName: candidateEmail,
        candidateEmail,
        source: 'site_web',
      },
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Get(':id/my-application')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Candidate)
  async getMyApplication(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest & { user?: { sub?: string; tenantId?: string } },
  ) {
    const nextTenantId = tenantId ?? req.user?.tenantId ?? '';
    if (!nextTenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const userId = req.user?.sub ?? '';
    if (!userId) {
      throw new BadRequestException('usuario candidato inválido');
    }

    return this.requisitionsService.getMyApplication(
      {
        tenantId: nextTenantId,
        requisitionId: id,
        userId,
      },
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Get('applications/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Candidate)
  async listMyApplications(
    @Query('tenantId') tenantId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: TransactionRequest & { user?: { sub?: string; tenantId?: string } },
  ) {
    const nextTenantId = tenantId ?? req.user?.tenantId ?? '';
    if (!nextTenantId) {
      throw new BadRequestException('tenantId requerido');
    }
    const userId = req.user?.sub ?? '';
    if (!userId) {
      throw new BadRequestException('usuario candidato inválido');
    }

    return this.requisitionsService.listApplicationsByUser(
      {
        tenantId: nextTenantId,
        userId,
        page: Number(page ?? 1),
        limit: Number(limit ?? 10),
      },
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async listCandidates(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }

    return this.requisitionsService.listApplicationsByRequisition(
      {
        tenantId,
        requisitionId: id,
        page: Number(page ?? 1),
        limit: Number(limit ?? 10),
      },
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Get(':id/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    Role.Owner,
    Role.HumanResource,
    Role.AreaManager,
    Role.Coordinator,
    Role.Supervisor,
  )
  async getMetrics(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId requerido');
    }

    return this.requisitionsService.getMetrics(
      {
        tenantId,
        requisitionId: id,
      },
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
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
