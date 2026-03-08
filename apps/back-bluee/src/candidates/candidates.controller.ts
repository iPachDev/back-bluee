import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TransactionRequest } from '../common/transaction.middleware';
import { CandidatesService } from './candidates.service';
import { AddContactDto } from './dto/add-contact.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import {
  RejectApplicationDto,
  UpdateStatusDto,
  WithdrawApplicationDto,
} from './dto/update-status.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @Roles(Role.Candidate, Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  create(
    @Body() payload: CreateApplicationDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.create(payload, req.user?.sub ?? 'system', {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  @Roles(Role.Candidate, Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  get(@Param('id') id: string, @Req() req: TransactionRequest) {
    return this.candidatesService.get(id, {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }

  @Get()
  @Roles(Role.Candidate, Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  list(
    @Query() query: QueryApplicationsDto,
    @Req() req: TransactionRequest & { user?: { sub?: string; roles?: string[] } },
  ) {
    const roles = req.user?.roles ?? [];
    const safeQuery: QueryApplicationsDto = { ...query };
    if (roles.includes(Role.Candidate)) {
      if (!req.user?.sub) {
        throw new Error('usuario candidato inválido');
      }
      safeQuery.candidateId = req.user.sub;
    }

    return this.candidatesService.list(safeQuery, {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }

  @Patch(':id/status')
  @Roles(Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStatusDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.updateStatus(
      id,
      payload,
      req.user?.sub ?? 'system',
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Post(':id/notes')
  @Roles(Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  addNote(
    @Param('id') id: string,
    @Body() payload: AddNoteDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.addNote(id, payload, req.user?.sub ?? 'system', {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }

  @Post(':id/contacts')
  @Roles(Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  addContact(
    @Param('id') id: string,
    @Body() payload: AddContactDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.addContact(
      id,
      payload,
      req.user?.sub ?? 'system',
      {
        transactionId: req.transactionId,
        source: 'back-bluee',
      },
    );
  }

  @Post(':id/reject')
  @Roles(Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  reject(
    @Param('id') id: string,
    @Body() payload: RejectApplicationDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.reject(id, payload, req.user?.sub ?? 'system', {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }

  @Post(':id/withdraw')
  @Roles(Role.Candidate, Role.Owner, Role.HumanResource, Role.AreaManager, Role.Coordinator, Role.Supervisor)
  withdraw(
    @Param('id') id: string,
    @Body() payload: WithdrawApplicationDto,
    @Req() req: TransactionRequest & { user?: { sub?: string } },
  ) {
    return this.candidatesService.withdraw(id, payload, req.user?.sub ?? 'system', {
      transactionId: req.transactionId,
      source: 'back-bluee',
    });
  }
}
