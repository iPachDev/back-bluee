import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.usersService.create(payload);
  }

  @Put()
  update(@Body() payload: Record<string, unknown>) {
    return this.usersService.update(payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.find({ _id: id });
  }

  @Get()
  getByEmployeeNumber(@Query('employeeNumber') employeeNumber?: string) {
    return this.usersService.find({ employeeNumber });
  }
}
