import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.create' })
  create(@Payload() payload: Record<string, unknown>) {
    return this.usersService.create(payload);
  }

  @MessagePattern({ cmd: 'users.update' })
  update(@Payload() payload: Record<string, unknown>) {
    return this.usersService.update(payload);
  }

  @MessagePattern({ cmd: 'users.delete' })
  remove(@Payload() payload: { _id?: string }) {
    return this.usersService.removeById(payload?._id ?? '');
  }

  @MessagePattern({ cmd: 'users.get' })
  get(@Payload() payload: { _id?: string; employeeNumber?: string }) {
    return this.usersService.findByIdOrEmployeeNumber({
      id: payload?._id,
      employeeNumber: payload?.employeeNumber,
    });
  }
}
