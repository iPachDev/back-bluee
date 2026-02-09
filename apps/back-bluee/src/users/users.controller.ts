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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.create(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Put()
  async update(
    @Body() payload: Record<string, unknown>,
    @Req() req: TransactionRequest,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.update(payload, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.usersService.remove(id, {
      transactionId,
      source: 'back-bluee',
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: TransactionRequest) {
    const transactionId = req.transactionId;
    return this.usersService.find(
      { _id: id },
      { transactionId, source: 'back-bluee' },
    );
  }

  @Get()
  async getByEmployeeNumber(
    @Query('employeeNumber') employeeNumber: string | undefined,
    @Req() req: TransactionRequest,
  ) {
    const transactionId = req.transactionId;
    return this.usersService.find(
      { employeeNumber },
      { transactionId, source: 'back-bluee' },
    );
  }
}
