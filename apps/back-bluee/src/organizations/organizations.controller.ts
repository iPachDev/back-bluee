import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { TransactionRequest } from '../common/transaction.middleware';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('public/by-slug/:slug')
  async getBySlugPublic(
    @Param('slug') slug: string,
    @Req() req: TransactionRequest,
  ) {
    const normalizedSlug = String(slug || '').trim().toLowerCase();
    if (!normalizedSlug) {
      throw new BadRequestException('slug requerido');
    }
    const transactionId = req.transactionId;
    return this.organizationsService.getBySlug(normalizedSlug, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    const userId = req.user?.sub ?? '';
    const createPayload = { ...payload, userId };
    const transactionId = req.transactionId;
    return this.organizationsService.create(createPayload, {
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
    const transactionId = req.transactionId;
    return this.organizationsService.update(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async remove(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.organizationsService.remove(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async getById(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.organizationsService.getById(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner)
  async list(@Req() req: TransactionRequest & { user?: { sub?: string } }) {
    const transactionId = req.transactionId;
    const userId = req.user?.sub ?? '';
    return this.organizationsService.listByUserId(userId, {
      transactionId,
      source: 'back-bluee',
    });
  }
}
