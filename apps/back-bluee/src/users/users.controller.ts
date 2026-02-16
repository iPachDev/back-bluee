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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TransactionRequest } from '../common/transaction.middleware';
import {
  type CreateUserDto,
  type ListUsersQueryDto,
  type UpdateUserDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() payload: CreateUserDto,
    @Req() req: TransactionRequest,
    _res?: unknown,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.create(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Put()
  async update(
    @Body() payload: UpdateUserDto,
    @Req() req: TransactionRequest,
    _res?: unknown,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.update(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    _res?: unknown,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.remove(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: TransactionRequest,
    _res?: unknown,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.find(
      { _id: id },
      { transactionId, source: 'back-bluee' },
    );
  }

  @Get()
  async list(
    @Query('tenantId') tenantId: string,
    @Query('employeeNumber') employeeNumber: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Query('status') status: string | undefined,
    @Query('search') search: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    const transactionId = req.transactionId;

    if (employeeNumber) {
      return this.usersService.find(
        { employeeNumber },
        { transactionId, source: 'back-bluee' },
      );
    }

    const payload: ListUsersQueryDto = {
      tenantId,
      page: Number.parseInt(page ?? '1', 10),
      limit: Number.parseInt(limit ?? '10', 10),
      status: status as ListUsersQueryDto['status'],
      search,
    };

    return this.usersService.list(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  async getByEmployeeNumber(
    employeeNumber: string | undefined,
    req: TransactionRequest,
    _res?: unknown,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.find(
      { employeeNumber },
      { transactionId, source: 'back-bluee' },
    );
  }
}
